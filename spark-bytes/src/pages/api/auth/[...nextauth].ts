import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // account *can* be null for some sign-in flows, so guard it:
      if (!account) return false;

      try {
        const googleId = account.providerAccountId;

        const res = await fetch(`http://127.0.0.1:8000/users/${googleId}`);

        if (res.status === 404) {
          await fetch("http://127.0.0.1:8000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: googleId,
              name: user.name,
              email: user.email,
            }),
          });
        }
      } catch (error) {
        console.error("Error checking/creating user:", error);
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.id = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
