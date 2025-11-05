import React from "react";
import { Form, Input, Button, Card, Select } from "antd";
import Layout from "../../components/layout";

const { Option } = Select;

const SignupForm: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Signup info:", values);
  };

  // confirm password validator
  const validatePassword = (_: any, value: string) => {
    if (!value || form.getFieldValue("password") === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match"));
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
            width: 320,
            backgroundColor: "#f0f0f0",
            padding: "12px",
            }}
        >
            <h3 style={{ marginBottom: 24, marginTop: 0 }}>Create Account</h3>

            <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            requiredMark={false}
            >
            {/* Email */}
            <Form.Item
                label="Email"
                name="email"
                rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
                ]}
            >
                <Input
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Enter your email"
                />
            </Form.Item>

            {/* Username */}
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Please choose a username" }]}
            >
                <Input
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Choose a username"
                />
            </Form.Item>

            {/* Password */}
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter a password" }]}
            >
                <Input.Password
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Enter a password"
                />
            </Form.Item>

            {/* Confirm password */}
            <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                { required: true, message: "Please confirm your password" },
                { validator: validatePassword },
                ]}
            >
                <Input.Password
                style={{ backgroundColor: "#f7caca" }}
                placeholder="Confirm your password"
                />
            </Form.Item>

            {/* Role dropdown */}
            <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: "Please select a role" }]}
            >
                <Select
                placeholder="Select your role"
                style={{ backgroundColor: "#f7caca" }}
                >
                <Option value="student">Student</Option>
                <Option value="teacher">Teacher</Option>
                <Option value="admin">Admin</Option>
                </Select>
            </Form.Item>

            {/* Submit */}
            <Form.Item>
                <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                    backgroundColor: "#6da9dc",
                    borderColor: "#6da9dc",
                    marginTop: "8px",
                }}
                >
                create account
                </Button>
            </Form.Item>
            </Form>

            <div style={{ textAlign: "center" }}>
            <a href="/auth/signin" style={{ color: "#4096ff" }}>
                Already have an account?
            </a>
            </div>
        </Card>
        </div>
    </Layout>
  );
};

export default SignupForm;
