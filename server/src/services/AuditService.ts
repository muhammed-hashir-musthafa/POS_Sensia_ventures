import { AuditLog } from '../models/index.js';

export class AuditService {
  static async logAction(
    userId: number,
    action: string,
    resource: string,
    resourceId?: number,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await AuditLog.create({
        userId,
        action,
        resource,
        resourceId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: true
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  static async logError(
    userId: number | undefined,
    action: string,
    resource: string,
    errorMessage: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await AuditLog.create({
        userId,
        action,
        resource,
        timestamp: new Date(),
        success: false,
        errorMessage,
        ipAddress,
        userAgent
      });
    } catch (error) {
      console.error('Error audit logging failed:', error);
    }
  }
}