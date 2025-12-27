import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();

        if (!user.email) return false;

        const teamExists = await Team.findOne({ email: user.email });

        return !!teamExists;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl;
      }

      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/round1`;
      }

      console.warn(`[Security] External redirect attempt blocked: ${url}`);
      return baseUrl + '/round1';
    },

    async jwt({ token, trigger }) {
      if (trigger === 'signIn' || trigger === 'update' || !token.teamId) {
        if (!token.email) return token;

        await connectDB();

        const team = await Team.findOne({ email: token.email });

        if (team) {
          token.teamId = team._id.toString();
          token.teamName = team.teamName;
          token.hasRound2Access = team.hasRound2Access || false;
          token.setCodeforcesHandle = team.codeforcesHandle == null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.setCodeforcesHandle =
          token.setCodeforcesHandle as boolean;
        session.user.teamId = token.teamId as string;
        session.user.name = token.teamName as string;
        session.user.hasRound2Access = token.hasRound2Access as boolean;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
