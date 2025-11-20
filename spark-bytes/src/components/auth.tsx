"use client";

import { Typography } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";

const { Link } = Typography;

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Link onClick={() => signIn("google")}>
        Sign in with Google
      </Link>
    );
  }

  return (
    <Link onClick={() => signOut()}>
      Logout
    </Link>
  );
}

