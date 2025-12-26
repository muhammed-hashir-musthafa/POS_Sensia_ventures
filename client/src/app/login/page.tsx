'use client';

import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { login } from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await dispatch(login(values)).unwrap();
      message.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2}>Sensia POS</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>
        
        <Card className="shadow-lg">
          <Form
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
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
                Sign In
              </Button>
            </Form.Item>
          </Form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <Text type="secondary">
              Demo Credentials:
            </Text>
            <br />
            <Text code>admin@example.com / admin123</Text>
            <br />
            <Text code>manager@example.com / manager123</Text>
          </div>
        </Card>
      </div>
    </div>
  );
}