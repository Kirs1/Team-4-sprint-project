import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Layout as AntLayout, Typography, Menu} from "antd";



import {
  HomeOutlined,
  TableOutlined,
  UserOutlined,

  InfoCircleOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = AntLayout;
const {Title} = Typography

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: <Link href="/">Home</Link> },
    

    { key: "/about", icon: <InfoCircleOutlined />, label: <Link href="/about">About</Link> },

    {key: "auth", icon: <UserOutlined/>, label:"Account", children: [
      { key: "/auth/signup", label: <Link href="/auth/signup">Sign up</Link>},

    { key: "/auth/signin", label: <Link href="/auth/signin">Sign in</Link>},
    ]},
    { key: "/events", icon: <TableOutlined/>, label: <Link href="/events">View Events</Link>}


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
          selectedKeys={[pathname]}
          items={menuItems}
          style={{
            flex: 1,
            justifyContent: "end",
            backgroundColor: "transparent",
          }}
        />
      </Header>

  
      <Content style={{ padding: "2rem", background: "#02325fff", flex: "1 0 auto" }}>
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