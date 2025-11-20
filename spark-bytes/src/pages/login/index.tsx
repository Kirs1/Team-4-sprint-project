"use client";

import { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/authcontext';
import { useRouter } from 'next/navigation';
import Layout from "../../components/layout";
import styles from '../../styles/auth.module.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');

  const onLogin = async (values: any) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: any) => {
    setLoading(true);
    try {
      await signup(values.email, values.fullName, values.password);
      message.success('Signup successful!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: 'Login',
                children: (
                  <Form
                    name="login"
                    onFinish={onLogin}
                    layout="vertical"
                    className={styles.authForm}
                  >
                    <Form.Item
                      label="BU Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Please input your BU email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                        { pattern: /@bu\.edu$/, message: 'Only BU email addresses are allowed!' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="your-email@bu.edu" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        block 
                        size="large"
                      >
                        Log in
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'signup',
                label: 'Sign Up',
                children: (
                  <Form
                    name="signup"
                    onFinish={onSignup}
                    layout="vertical"
                    className={styles.authForm}
                  >
                    <Form.Item
                      label="Full Name"
                      name="fullName"
                      rules={[{ required: true, message: 'Please input your full name!' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Full Name" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="BU Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Please input your BU email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                        { pattern: /@bu\.edu$/, message: 'Only BU email addresses are allowed!' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="your-email@bu.edu" 
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Confirm Password"
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm Password"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        block 
                        size="large"
                      >
                        Sign Up
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </Layout>
  );
}