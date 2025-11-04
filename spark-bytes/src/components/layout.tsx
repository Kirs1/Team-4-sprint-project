import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}