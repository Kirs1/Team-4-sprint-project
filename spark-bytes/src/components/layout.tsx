"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Layout as AntLayout, Typography, Menu, Dropdown, Space, Button } from "antd";
import { useAuth } from "../../contexts/authcontext";
import {
  HomeOutlined,
  TableOutlined,
  UserOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "/about",
      icon: <InfoCircleOutlined />,
      label: <Link href="/about">About</Link>,
    },
    {
      key: "/events",
      icon: <TableOutlined />,
      label: <Link href="/events">View Events</Link>,
    },
    {
      key: "/events/create",
      icon: <PlusOutlined />,
      label: <Link href="/events/create">Create Event</Link>
    },
    ...(user ? [
      {
        key: "user-menu",
        icon: <UserOutlined />,
        label: (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer", color: "white" }}>
              <UserOutlined />
              <span>{user.full_name}</span>
            </Space>
          </Dropdown>
        ),
      }
    ] : [
      {
        key: "/login",
        icon: <UserOutlined />,
        label: <Link href="/login">Login</Link>,
      }
    ]),
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#001529",
          padding: "0 2rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Title level={3} style={{ color: "white", margin: 0 }}>
            Spark!Bytes
          </Title>
        </Link>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname ?? ""]}
          items={menuItems}
          style={{
            flex: 1,
            justifyContent: "end",
            backgroundColor: "transparent",
          }}
        />
      </Header>

      <Content
        style={{
          padding: "2rem",
          background: "#02325fff",
          flex: "1 0 auto",
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#001529",
          color: "white",
        }}
      >
        © 2025 Spark!Bytes | Built by BU Students for CS391
      </Footer>
    </AntLayout>
  );
}