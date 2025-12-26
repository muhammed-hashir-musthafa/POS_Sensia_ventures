"use client"

import React, { useMemo } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CommentOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { usePermissions } from '@/hooks/usePermissions'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()

  const { user } = useSelector((state: RootState) => state.auth)
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui)
  const { canView } = usePermissions()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => router.push('/dashboard'),
      },
    ]

    if (canView('products')) {
      items.push({
        key: '/products',
        icon: <ShoppingOutlined />,
        label: 'Products',
        onClick: () => router.push('/products'),
      })
    }

    if (canView('clients')) {
      items.push({
        key: '/clients',
        icon: <UserOutlined />,
        label: 'Clients',
        onClick: () => router.push('/clients'),
      })
    }

    if (canView('orders')) {
      items.push({
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: 'Orders',
        onClick: () => router.push('/orders'),
      })
    }

    if (canView('comments')) {
      items.push({
        key: '/comments',
        icon: <CommentOutlined />,
        label: 'Comments',
        onClick: () => router.push('/comments'),
      })
    }

    return items
  }, [canView, router])

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        trigger={null}
        width={240}
        className="bg-white shadow-md"
      >
        <div className="p-4 text-center border-b">
          <Text strong className="text-lg">
            {sidebarCollapsed ? 'SP' : 'Sensia POS'}
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 shadow-sm flex justify-between items-center">
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch(toggleSidebar())}
          />

          <Space>
            <Text>Welcome, {user?.name}</Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                icon={<UserOutlined />}
                className="cursor-pointer bg-blue-500"
              />
            </Dropdown>
          </Space>
        </Header>

        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm min-h-[calc(100vh-140px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
