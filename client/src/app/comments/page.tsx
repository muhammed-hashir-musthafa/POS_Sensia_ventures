'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import CommentManager from '@/components/CommentManager';

export default function CommentsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PermissionGuard resource="comments" action="view">
          <CommentManager />
        </PermissionGuard>
      </MainLayout>
    </ProtectedRoute>
  );
}