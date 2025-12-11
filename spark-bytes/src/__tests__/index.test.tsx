// src/__tests__/index.test.tsx
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import Home from "@/pages/index";

// ---- mock next-auth/react ----
jest.mock("next-auth/react", () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSession: () => ({
    data: null,
    status: "unauthenticated" as const,
  }),
}));

// ---- mock next/navigation  usePathname ----
jest.mock("next/navigation", () => ({
  __esModule: true,
  usePathname: () => "/",
}));

describe("Home page", () => {

  it("renders the main welcome title", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /welcome to spark!bytes/i })
    ).toBeInTheDocument();
  });


  it("renders navigation items in the header (logo, About, View Events, Account)", () => {
    render(<Home />);


    const header = screen.getByRole("banner");

    // 2.1 Logo link
    const logoLink = within(header).getByRole("link", {
      name: /spark!bytes/i,
    });
    expect(logoLink).toHaveAttribute("href", "/");

    // 2.2 about link
    const aboutNavLink = within(header).getByRole("link", {
      name: /about/i,
    });
    expect(aboutNavLink).toHaveAttribute("href", "/about");

    // 2.3 View Events link
    const eventsNavLink = within(header).getByRole("link", {
      name: /view events/i,
    });
    expect(eventsNavLink).toHaveAttribute("href", "/events");

    // 2.4 Account link
    expect(within(header).getByText(/account/i)).toBeInTheDocument();
  });

  // 3. hero section with CTA buttons
  it("renders the hero section with CTA buttons", () => {
    render(<Home />);

    const main = screen.getByRole("main");

    // 3.1 Hero title
    expect(
      within(main).getByRole("heading", { name: /welcome to spark!bytes/i })
    ).toBeInTheDocument();

    // 3.2 CTA buttons
    const heroEventsLink = within(main).getByRole("link", {
      name: /view events/i,
    });
    expect(heroEventsLink).toHaveAttribute("href", "/events");

    // 3.3 About us button
    const heroAboutLink = within(main).getByRole("link", {
      name: /about us/i,
    });
    expect(heroAboutLink).toHaveAttribute("href", "/about");
  });

  // 4. check link to events page
  it("has at least one link to the events page", () => {
    render(<Home />);

    const eventsLinks = screen.getAllByRole("link", {
      name: /view events/i,
    });

    const eventsLink = eventsLinks.find(
      (link) => link.getAttribute("href") === "/events"
    );

    expect(eventsLink).toBeTruthy();
    expect(eventsLink).toHaveAttribute("href", "/events");
  });

  // 5. check footer
  it("renders the footer text", () => {
    render(<Home />);

    const footer = screen.getByRole("contentinfo");

    expect(
      within(footer).getByText(
        /© 2025 spark!bytes \| built by bu students for cs391/i
      )
    ).toBeInTheDocument();
  });
});
