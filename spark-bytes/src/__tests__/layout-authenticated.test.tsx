// src/__tests__/layout-authenticated.test.tsx
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Layout from "@/components/layout";

// ---- mock next-auth/react：make useSession return "authenticated" ----
jest.mock("next-auth/react", () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSession: () => ({
    status: "authenticated" as const,
    data: {
      user: {
        name: "Test User",
        email: "test@bu.edu",
      },
    },
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// ---- mock next/navigation usePathname ----
jest.mock("next/navigation", () => ({
  __esModule: true,
  usePathname: () => "/dashboard",
}));


jest.mock("antd", () => {
  const actualAntd = jest.requireActual("antd");


  const SimpleMenu = ({ items }: { items?: any[] }) => (
    <nav data-testid="mock-menu">
      {items?.map((item) => (
        <div key={item.key}>
          {item.label}
          {item.children &&
            item.children.map((child: any) => (
              <div key={child.key}>{child.label}</div>
            ))}
        </div>
      ))}
    </nav>
  );

  return {
    ...actualAntd,
    Menu: SimpleMenu,
  };
});

describe("Layout component (authenticated user)", () => {
  it("renders children content inside the layout", () => {
    render(
      <Layout>
        <div>Dashboard content</div>
      </Layout>
    );

    expect(screen.getByText(/dashboard content/i)).toBeInTheDocument();
  });

  it("shows a Dashboard link in the Account menu when user is authenticated", () => {
    render(
      <Layout>
        <div>Dashboard content</div>
      </Layout>
    );


    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });
});

