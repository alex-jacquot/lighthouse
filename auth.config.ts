import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './src/server/db';

const credentialsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (rawCredentials) => {
                const parsed = credentialsSchema.safeParse(rawCredentials);

                if (!parsed.success) return null;

                const { username, password } = parsed.data;

                const user = await prisma.user.findUnique({
                    where: { username },
                });

                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(password, user.passwordHash);

                if (!isValid) return null;

                return {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim() || user.username,
                    username: user.username,
                    imageUrl: (user as { imageUrl?: string | null }).imageUrl ?? undefined,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as { id?: string }).id;
                token.username = (user as { username?: string }).username;
                token.image = (user as { imageUrl?: string | null }).imageUrl ?? token.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = (token as { id?: string }).id;
                (session.user as { username?: string }).username = (token as { username?: string }).username;
                session.user.image = (token as { image?: string }).image ?? session.user.image;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
} satisfies NextAuthConfig;

