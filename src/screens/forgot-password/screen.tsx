'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const forgotSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordScreen() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<ForgotFormValues>({
        defaultValues: {
            username: '',
        },
    });

    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [devToken, setDevToken] = useState<string | null>(null);

    async function onSubmit(values: ForgotFormValues) {
        const parsed = forgotSchema.safeParse(values);

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            if (fieldErrors.username?.[0])
                setError('username', { type: 'manual', message: fieldErrors.username[0] });
            return;
        }

        setFormMessage(null);
        setDevToken(null);

        const response = await fetch('/api/auth/request-password-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: values.username }),
        });

        const data = (await response.json()) as { success?: boolean; token?: string; error?: string };

        if (!response.ok || !data.success) {
            setFormMessage(data.error ?? 'Unable to process request. Please try again.');
            return;
        }

        setFormMessage(
            'If an account with that username exists, a reset link has been generated. For development, use the token below to reset your password.'
        );

        if (data.token) setDevToken(data.token);
    }

    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Forgot password</h1>
            <p className="mt-2 text-muted-foreground">
                Enter your username and we&apos;ll generate a password reset token.
            </p>

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

                {formMessage ? <p className="text-sm text-muted-foreground">{formMessage}</p> : null}
                {devToken ? (
                    <div className="rounded-md bg-muted p-3">
                        <p className="text-xs font-medium text-muted-foreground">Development reset token</p>
                        <p className="mt-1 break-all text-xs">{devToken}</p>
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Requesting…' : 'Request reset link'}
                </button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
                Remembered your password?{' '}
                <Link href="/login" className="text-accent hover:underline">
                    Log in
                </Link>
            </p>

            <Link href="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-accent">
                ← Back to home
            </Link>
        </main>
    );
}

