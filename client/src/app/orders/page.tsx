'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import OrderManager from '@/components/OrderManager';

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PermissionGuard resource="orders" action="view">
          <OrderManager />
        </PermissionGuard>
      </MainLayout>
    </ProtectedRoute>
  );
}