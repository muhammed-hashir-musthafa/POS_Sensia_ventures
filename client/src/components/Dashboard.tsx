"use client";

import React, { useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Typography,
  Space,
} from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from './common/PermissionGuard';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchOrders } from '../store/slices/orderSlice';
import { fetchClients } from '../store/slices/clientSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { user } = useSelector((state: RootState) => state.auth);
  const { canView } = usePermissions();

  useEffect(() => {
    if (canView('products')) {
      dispatch(fetchProducts());
    }
    if (canView('orders')) {
      dispatch(fetchOrders());
    }
    if (canView('clients')) {
      dispatch(fetchClients());
    }
  }, [dispatch, canView]);

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const todayRevenue = orders
    .filter(order => 
      order.status === 'completed' && 
      dayjs(order.createdAt).isSame(dayjs(), 'day')
    )
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const lowStockProducts = products.filter(product => product.stock <= 10);
  const recentOrders = orders
    .sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const recentOrderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Client',
      dataIndex: ['client', 'name'],
      key: 'client',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">
          Welcome back, {user?.name}!
        </Text>
      </div>

      <Row gutter={16}>
        <PermissionGuard resource="orders" action="view">
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Revenue"
                value={todayRevenue}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="USD"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </PermissionGuard>
        
        <PermissionGuard resource="orders" action="view">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={totalRevenue}
                precision={2}
                prefix={<RiseOutlined />}
                suffix="USD"
              />
            </Card>
          </Col>
        </PermissionGuard>

        <PermissionGuard resource="orders" action="view">
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={pendingOrders.length}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: pendingOrders.length > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
        </PermissionGuard>

        <PermissionGuard resource="products" action="view">
          <Col span={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={lowStockProducts.length}
                prefix={<WarningOutlined />}
                valueStyle={{ color: lowStockProducts.length > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
        </PermissionGuard>
      </Row>

      <Row gutter={16}>
        <PermissionGuard resource="orders" action="view">
          <Col span={16}>
            <Card title="Recent Orders" className="h-96">
              <Table
                columns={recentOrderColumns}
                dataSource={recentOrders}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </PermissionGuard>

        <Col span={8}>
          <Card title="Alerts" className="h-96">
            <div className="space-y-4">
              <PermissionGuard resource="products" action="view">
                <div>
                  <Text strong className="text-red-500">
                    Low Stock Alert
                  </Text>
                  <List
                    size="small"
                    dataSource={lowStockProducts.slice(0, 5)}
                    renderItem={(product) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ShoppingOutlined />} />}
                          title={product.name}
                          description={`Stock: ${product.stock}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </PermissionGuard>

              <PermissionGuard resource="orders" action="view">
                <div>
                  <Text strong className="text-orange-500">
                    Pending Orders
                  </Text>
                  <List
                    size="small"
                    dataSource={pendingOrders.slice(0, 3)}
                    renderItem={(order) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                          title={`Order #${order.id}`}
                          description={`${order.client?.name} - $${order.totalAmount.toFixed(2)}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </PermissionGuard>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}