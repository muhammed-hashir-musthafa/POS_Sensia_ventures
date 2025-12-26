'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css'
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <Provider store={store}>
              <div id="root">
                {children}
              </div>
            </Provider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}