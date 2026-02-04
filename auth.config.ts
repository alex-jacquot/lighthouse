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
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
} satisfies NextAuthConfig;

