import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyCustomerCredentials } from '@/lib/verifyCustomerCredentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        return verifyCustomerCredentials(email, password);
      },
    }),
  ],
});
