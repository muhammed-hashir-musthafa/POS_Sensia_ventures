import { Request, Response } from 'express';
import { Client } from '../models/index.js';
import { AuditService } from '../services/AuditService.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, customerType, creditLimit } = req.body;
    const userId = req.user?.id;
    
    // Generate customer code
    const customerCode = `CLT-${Date.now()}`;
    
    const client = await Client.create({ 
      name, 
      email, 
      phone, 
      address,
      customerCode,
      customerType: customerType || 'regular',
      creditLimit: parseFloat(creditLimit || 0),
      loyaltyPoints: 0,
      isActive: true
    });

    // Log the action
    await AuditService.logAction(
      userId,
      'create',
      'client',
      client.id,
      null,
      client.toJSON(),
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(client);
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'create',
      'client',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, customerType, creditLimit } = req.body;
    const userId = req.user?.id;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const oldValues = client.toJSON();
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (customerType !== undefined) updateData.customerType = customerType;
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);

    await client.update(updateData);
    
    // Log the action
    await AuditService.logAction(
      userId,
      'update',
      'client',
      client.id,
      oldValues,
      client.toJSON(),
      req.ip,
      req.get('User-Agent')
    );

    res.json(client);
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'update',
      'client',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const clientData = client.toJSON();
    await client.destroy();
    
    // Log the action
    await AuditService.logAction(
      userId,
      'delete',
      'client',
      parseInt(id),
      clientData,
      null,
      req.ip,
      req.get('User-Agent')
    );

    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'delete',
      'client',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};