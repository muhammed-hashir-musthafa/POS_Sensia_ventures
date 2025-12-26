'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductsModule } from '@/components/modules/ProductsModule';

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PermissionGuard resource="products" action="view">
          <ProductsModule />
        </PermissionGuard>
      </MainLayout>
    </ProtectedRoute>
  );
}