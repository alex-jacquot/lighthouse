'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? '/';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormValues>({
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const [formError, setFormError] = useState<string | null>(null);

    async function onSubmit(values: LoginFormValues) {
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;

            if (fieldErrors.username?.[0])
                setError('username', { type: 'manual', message: fieldErrors.username[0] });

            if (fieldErrors.password?.[0])
                setError('password', { type: 'manual', message: fieldErrors.password[0] });

            return;
        }

        setFormError(null);

        const result = await signIn('credentials', {
            username: values.username,
            password: values.password,
            redirect: false,
            callbackUrl,
        });

        if (result?.error) {
            setFormError('Invalid username or password.');
            return;
        }

        router.push(callbackUrl);
    }

    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Log in</h1>
            <p className="mt-2 text-muted-foreground">Enter your credentials to access Lighthouse.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        {...register('username')}
                    />
                    {errors.username?.message ? (
                        <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        {...register('password')}
                    />
                    {errors.password?.message ? (
                        <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    ) : null}
                </div>

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Signing in…' : 'Log in'}
                </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
                <Link href="/signup" className="text-accent hover:underline">
                    Create an account
                </Link>
                <Link href="/forgot-password" className="text-accent hover:underline">
                    Forgot password?
                </Link>
            </div>

            <Link href="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-accent">
                ← Back to home
            </Link>
        </main>
    );
}

