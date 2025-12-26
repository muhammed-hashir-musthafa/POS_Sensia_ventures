import { Request, Response } from 'express';
import { Comment, User } from '../models/index.js';
import type { CommentAttributes } from '../types/index.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.create({ content, userId, isActive: true });
    
    const createdComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json(createdComment);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role.name;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    await comment.update({ content });
    
    const updatedComment = await Comment.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    res.json(updatedComment);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role.name;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};