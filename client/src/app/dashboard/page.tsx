'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/components/modules/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  );
}