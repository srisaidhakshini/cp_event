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
    //Allow login only if email exists in Team DB
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

    // Redirect after successful sign in
    async redirect({ url, baseUrl }) {
      // Always redirect to round1 after sign in
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/round1`;
      }
      return baseUrl + '/round1';
    },

    //  Runs on login & every request (JWT creation)
    async jwt({ token }) {
      if (!token.email) return token;

      await connectDB();

      const team = await Team.findOne({ email: token.email });

      if (team) {
        // Store teamId in token
        token.teamId = team._id.toString();
        // if team exists, check codeforcesHandle
        token.setCodeforcesHandle = team.codeforcesHandle == null;
      }

      return token;
    },

    // Expose value to frontend session
    async session({ session, token }) {
      if (session.user) {
        session.user.setCodeforcesHandle =
          token.setCodeforcesHandle as boolean;
        session.user.teamId = token.teamId as string;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
