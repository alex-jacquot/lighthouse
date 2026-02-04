'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const resetSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Please confirm your password'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetFormValues = z.infer<typeof resetSchema>;

interface ResetPasswordScreenProps {
    token: string | null;
}

export function ResetPasswordScreen(props: ResetPasswordScreenProps) {
    const { token } = props;
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<ResetFormValues>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    async function onSubmit(values: ResetFormValues) {
        if (!token) {
            setFormError('Reset token is missing. Please request a new password reset link.');
            return;
        }

        const parsed = resetSchema.safeParse(values);

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;

            (Object.keys(fieldErrors) as (keyof ResetFormValues)[]).forEach(key => {
                const message = fieldErrors[key]?.[0];
                if (message) setError(key, { type: 'manual', message });
            });

            return;
        }

        setFormError(null);
        setFormSuccess(null);

        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                password: values.password,
            }),
        });

        const data = (await response.json()) as { success?: boolean; error?: string };

        if (!response.ok || !data.success) {
            setFormError(data.error ?? 'Unable to reset password. Please try again.');
            return;
        }

        setFormSuccess('Your password has been updated. Redirecting to log in…');

        setTimeout(() => {
            router.push('/login');
        }, 1000);
    }

    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Reset password</h1>
            <p className="mt-2 text-muted-foreground">
                Enter a new password for your Lighthouse account.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        {...register('password')}
                    />
                    {errors.password?.message ? (
                        <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                        Confirm new password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword?.message ? (
                        <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
                    ) : null}
                </div>

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                {formSuccess ? <p className="text-sm text-emerald-600">{formSuccess}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Updating password…' : 'Reset password'}
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

