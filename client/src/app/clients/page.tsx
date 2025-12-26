'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import ClientManager from '@/components/ClientManager';

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PermissionGuard resource="clients" action="view">
          <ClientManager />
        </PermissionGuard>
      </MainLayout>
    </ProtectedRoute>
  );
}