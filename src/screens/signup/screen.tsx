'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signupSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(32, 'Username must be at most 32 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Please confirm your password'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupScreen() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<SignupFormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            confirmPassword: '',
        },
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setAvatarFile(null);
        setAvatarError(null);

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAvatarError('Avatar must be an image file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Avatar must be smaller than 2MB.');
            return;
        }

        setAvatarFile(file);
    }

    async function onSubmit(values: SignupFormValues) {
        const parsed = signupSchema.safeParse(values);

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;

            (Object.keys(fieldErrors) as (keyof SignupFormValues)[]).forEach(key => {
                const message = fieldErrors[key]?.[0];
                if (message) setError(key, { type: 'manual', message });
            });

            return;
        }

        setFormError(null);
        setFormSuccess(null);

        const formData = new FormData();
        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('username', values.username);
        formData.append('password', values.password);
        if (avatarFile) formData.append('avatar', avatarFile);

        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const data = (await response.json()) as { error?: string };
            setFormError(data.error ?? 'Unable to create account. Please try again.');
            return;
        }

        setFormSuccess('Account created successfully. Redirecting to log in…');

        setTimeout(() => {
            router.push('/login');
        }, 1000);
    }

    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Sign up</h1>
            <p className="mt-2 text-muted-foreground">Create your Lighthouse account.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium">
                            First name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            {...register('firstName')}
                        />
                        {errors.firstName?.message ? (
                            <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
                        ) : null}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium">
                            Last name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            {...register('lastName')}
                        />
                        {errors.lastName?.message ? (
                            <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                        ) : null}
                    </div>
                </div>

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
                        autoComplete="new-password"
                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        {...register('password')}
                    />
                    {errors.password?.message ? (
                        <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium">
                        Profile picture (optional)
                    </label>
                    <input
                        id="avatar"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarChange}
                        className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent-foreground hover:file:bg-accent/90"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG or WebP, up to 2MB. We&apos;ll crop it to a round avatar.
                    </p>
                    {avatarError ? <p className="mt-1 text-xs text-destructive">{avatarError}</p> : null}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                        Confirm password
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
                    {isSubmitting ? 'Creating account…' : 'Sign up'}
                </button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
                Already have an account?{' '}
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

