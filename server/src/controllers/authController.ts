import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/index.js";
import { config } from "../config/env.js";
import { AuthorizationService } from "../services/AuthorizationService.js";
import type { StringValue } from "ms";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const jwtOptions: SignOptions = {
      expiresIn: config.JWT_EXPIRES_IN as StringValue,
    };

    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, jwtOptions);

    // Get user permissions
    const permissions = await AuthorizationService.getUserPermissions(user.id);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        permissions
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }

    // Check if user is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
        lockedUntil: user.lockedUntil
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const maxAttempts = 5;
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      
      const updateData: any = {
        failedLoginAttempts: newFailedAttempts
      };
      
      // Lock account if max attempts reached
      if (newFailedAttempts >= maxAttempts) {
        updateData.lockedUntil = new Date(Date.now() + lockDuration);
      }
      
      await user.update(updateData);
      
      return res.status(401).json({ 
        message: "Invalid credentials",
        attemptsRemaining: Math.max(0, maxAttempts - newFailedAttempts)
      });
    }

    // Successful login - reset failed attempts and update last login
    await user.update({
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: new Date()
    });

    const jwtOptions: SignOptions = {
      expiresIn: config.JWT_EXPIRES_IN as StringValue,
    };

    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, jwtOptions);

    // Get user permissions
    const permissions = await AuthorizationService.getUserPermissions(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        permissions
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
