'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(32, 'Username must be at most 32 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    imageUrl: z.string().url().nullable().optional(),
});

interface ProfileFormState {
    firstName: string;
    lastName: string;
    username: string;
    imageUrl: string | null;
}

interface FieldErrors {
    firstName?: string;
    lastName?: string;
    username?: string;
    imageUrl?: string;
}

export function ProfileScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [state, setState] = useState<ProfileFormState>({
        firstName: '',
        lastName: '',
        username: '',
        imageUrl: null,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/profile', { method: 'GET' });
                if (response.status === 401) {
                    router.push('/login?callbackUrl=/profile');
                    return;
                }
                if (!response.ok) {
                    setFormError('Unable to load profile. Please try again later.');
                    return;
                }

                const data = (await response.json()) as ProfileFormState;
                if (!isMounted) return;

                setState({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    imageUrl: data.imageUrl ?? null,
                });
                setAvatarPreview(data.imageUrl ?? null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, [router]);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setState(prev => ({ ...prev, [id]: value }));
        setErrors(prev => ({ ...prev, [id]: undefined }));
    }

    function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            setAvatarFile(null);
            setAvatarPreview(state.imageUrl);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, imageUrl: 'Avatar must be an image file.' }));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, imageUrl: 'Avatar must be smaller than 2MB.' }));
            return;
        }

        setAvatarFile(file);
        setErrors(prev => ({ ...prev, imageUrl: undefined }));

        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        setErrors({});

        let imageUrl = state.imageUrl;

        if (avatarFile) {
            const formData = new FormData();
            formData.append('file', avatarFile);
            const uploadResponse = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const data = (await uploadResponse.json()) as { error?: string };
                setErrors(prev => ({
                    ...prev,
                    imageUrl: data.error ?? 'Failed to upload avatar.',
                }));
                return;
            }

            const data = (await uploadResponse.json()) as { url: string };
            imageUrl = data.url;
        }

        const parsed = profileSchema.safeParse({
            firstName: state.firstName,
            lastName: state.lastName,
            username: state.username,
            imageUrl,
        });

        if (!parsed.success) {
            const flat = parsed.error.flatten().fieldErrors;
            const nextErrors: FieldErrors = {};
            if (flat.firstName?.[0]) nextErrors.firstName = flat.firstName[0];
            if (flat.lastName?.[0]) nextErrors.lastName = flat.lastName[0];
            if (flat.username?.[0]) nextErrors.username = flat.username[0];
            if (flat.imageUrl?.[0]) nextErrors.imageUrl = flat.imageUrl[0];
            setErrors(nextErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: parsed.data.firstName,
                    lastName: parsed.data.lastName,
                    username: parsed.data.username,
                    imageUrl: parsed.data.imageUrl ?? null,
                }),
            });

            if (!response.ok) {
                const data = (await response.json()) as { error?: string };
                setFormError(data.error ?? 'Unable to update profile. Please try again.');
                return;
            }

            const updated = (await response.json()) as ProfileFormState;
            setState({
                firstName: updated.firstName,
                lastName: updated.lastName,
                username: updated.username,
                imageUrl: updated.imageUrl ?? null,
            });
            setAvatarFile(null);
            setAvatarPreview(updated.imageUrl ?? null);
            setFormSuccess('Profile updated successfully.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const initials =
        state.firstName && state.lastName
            ? `${state.firstName[0] ?? ''}${state.lastName[0] ?? ''}`.toUpperCase()
            : state.username.slice(0, 2).toUpperCase();

    return (
        <main className="mx-auto max-w-xl px-4 py-10">
            <h1 className="font-heading text-2xl font-bold">Your profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Update your basic information and profile picture.
            </p>

            {isLoading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading profile…</p>
            ) : (
                <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
                    <section aria-label="Profile picture" className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Profile picture preview"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                    {initials || 'U'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="avatar"
                                className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                Change picture
                            </label>
                            <input
                                id="avatar"
                                name="avatar"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                PNG, JPG or WebP, up to 2MB. We&apos;ll crop it to a round avatar.
                            </p>
                            {errors.imageUrl ? (
                                <p className="mt-1 text-xs text-destructive">{errors.imageUrl}</p>
                            ) : null}
                        </div>
                    </section>

                    <section aria-label="Basic information" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium">
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={state.firstName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                {errors.firstName ? (
                                    <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
                                ) : null}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium">
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={state.lastName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                {errors.lastName ? (
                                    <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
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
                                value={state.username}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            {errors.username ? (
                                <p className="mt-1 text-xs text-destructive">{errors.username}</p>
                            ) : null}
                        </div>
                    </section>

                    {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                    {formSuccess ? <p className="text-sm text-emerald-600">{formSuccess}</p> : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Saving changes…' : 'Save changes'}
                    </button>
                </form>
            )}
        </main>
    );
}

