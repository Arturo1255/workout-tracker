import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {db} from "../../../../src/prisma/db";
import type { AuthOptions } from "next-auth";


export const authOptions: AuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          
          if (!credentials?.username || !credentials.password){
            return null;
          }

          const user = await db.orm.public.User.where({username: credentials.username}).first();

          if (!user){
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isCorrectPassword){
                return null;
          }

          return {id: user.id.toString(), name: user.name, username: user.username, email: user.email};

        },
      }),
    ],
    session: { strategy: "jwt"},
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id; // runs once, right after login
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id;
        } // runs on every session check
        return session;
      },
    },
  };
  
  const handler = NextAuth(authOptions);
  
  export { handler as GET, handler as POST };