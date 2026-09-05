import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {db} from "../../../../src/prisma/db";


const handler = NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          // your logic goes here
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
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  export { handler as GET, handler as POST };