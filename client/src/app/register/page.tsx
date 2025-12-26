'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { register } from '@/store/slices/authSlice';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { RegisterData, Role } from '@/types';
import api from '@/lib/api';

const { Title } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (error) {
        message.error('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (values: RegisterData) => {
    try {
      await dispatch(register(values)).unwrap();
      message.success('User registered successfully!');
      router.push('/dashboard');
    } catch (error) {
      message.error('Registration failed. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <PermissionGuard resource="users" action="create">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Title level={2}>Register New User</Title>
            </div>
            
            <Card className="shadow-lg">
              <Form
                form={form}
                name="register"
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please input the full name!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter full name"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input the email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter email address"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please input the password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter password"
                  />
                </Form.Item>

                <Form.Item
                  name="roleId"
                  label="Role"
                  rules={[{ required: true, message: 'Please select a role!' }]}
                >
                  <Select placeholder="Select user role">
                    {roles.map((role) => (
                      <Select.Option key={role.id} value={role.id}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {error && (
                  <div className="mb-4 text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="w-full"
                  >
                    Register User
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="default"
                    onClick={() => router.push('/dashboard')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </PermissionGuard>
    </ProtectedRoute>
  );
}