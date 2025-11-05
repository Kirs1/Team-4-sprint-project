import React from "react";
import { Form, Input, Button, Card } from "antd";
import Layout from "../../components/layout";

const LoginForm: React.FC = () => {
  const onFinish = (values: any) => {
    console.log("Login info:", values);
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Card
          style={{
            width: 300,
            backgroundColor: "#f0f0f0",
            textAlign: "left",
            padding: "12px",
          }}
        >
          <h3 style={{ marginBottom: 24, marginTop: 0 }}>Login</h3>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Enter your email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  backgroundColor: "#6da9dc",
                  borderColor: "#6da9dc",
                  marginTop: "4px",
                }}
              >
                continue
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <a href="/auth/signup" style={{ color: "#4096ff" }}>
              New users?
            </a>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LoginForm;
