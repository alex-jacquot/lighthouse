'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { trpc } from '@/trpc/client';

const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    category: z.enum(['general', 'tech', 'life', 'art', 'random']),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

const CATEGORIES: { id: 'all' | CreatePostFormValues['category']; label: string }[] = [
    { id: 'all', label: 'All posts' },
    { id: 'general', label: 'General' },
    { id: 'tech', label: 'Tech' },
    { id: 'life', label: 'Life' },
    { id: 'art', label: 'Art' },
    { id: 'random', label: 'Random' },
];

export function HomeFeedScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] =
        useState<(typeof CATEGORIES)[number]['id']>('all');

    const { data: posts, isLoading, refetch } = trpc.post.list.useQuery(
        { category: selectedCategory === 'all' ? 'all' : selectedCategory },
        {
            staleTime: 10_000,
        }
    );

    const utils = trpc.useUtils();
    const createPost = trpc.post.create.useMutation({
        onSuccess: async () => {
            await utils.post.list.invalidate();
        },
        onError: (error) => {
            if (error.data?.code === 'UNAUTHORIZED') {
                router.push('/login?callbackUrl=/home');
            }
        },
    });

    const [formValues, setFormValues] = useState<CreatePostFormValues>({
        title: '',
        description: '',
        category: 'general',
    });
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreatePostFormValues, string>>>(
        {}
    );
    const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleFieldChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = event.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value,
        }));
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
        setFormErrorMessage(null);
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setImageFile(null);
        setImageError(null);
        setImagePreview(null);

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Image must be a valid image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageError('Image must be smaller than 5MB.');
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrorMessage(null);
        setFormErrors({});

        const parsed = createPostSchema.safeParse(formValues);

        if (!parsed.success) {
            const flat = parsed.error.flatten().fieldErrors;
            const nextErrors: Partial<Record<keyof CreatePostFormValues, string>> = {};
            if (flat.title?.[0]) nextErrors.title = flat.title[0];
            if (flat.description?.[0]) nextErrors.description = flat.description[0];
            if (flat.category?.[0]) nextErrors.category = flat.category[0];
            setFormErrors(nextErrors);
            return;
        }

        let imageUrl: string | undefined;

        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);

            const uploadResponse = await fetch('/api/posts/image', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                const data = (await uploadResponse.json()) as { error?: string };
                setImageError(data.error ?? 'Failed to upload image.');
                return;
            }

            const data = (await uploadResponse.json()) as { url: string };
            imageUrl = data.url;
        }

        await createPost.mutateAsync({
            title: parsed.data.title,
            description: parsed.data.description,
            category: parsed.data.category,
            imageUrl,
        });

        if (!createPost.error) {
            setFormValues({
                title: '',
                description: '',
                category: 'general',
            });
            setImageFile(null);
            setImagePreview(null);
            setIsModalOpen(false);
            await refetch();
        } else {
            setFormErrorMessage(createPost.error.message ?? 'Unable to create post.');
        }
    }

    return (
        <>
        <main className="mx-auto flex max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <aside className="hidden w-60 shrink-0 border-r border-border pr-4 sm:block">
                <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                    Feed filters
                </h2>
                <nav className="mt-4 space-y-1" aria-label="Post categories">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                                selectedCategory === category.id
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-foreground hover:bg-white/5'
                            }`}
                        >
                            <span>{category.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <section className="flex-1 space-y-8">
                <section className="mb-2 -mt-2 flex items-center gap-2 overflow-x-auto border-b border-border pb-2 sm:hidden">
                    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                        Filter:
                    </span>
                    <div className="flex gap-2">
                        {CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                                    selectedCategory === category.id
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </section>
                <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-heading text-base font-semibold">Create a post</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Share something with the Lighthouse community.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                        >
                            New post
                        </button>
                    </div>
                </section>

                <section aria-label="Recent posts" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-base font-semibold">
                            {selectedCategory === 'all'
                                ? 'All posts'
                                : CATEGORIES.find(c => c.id === selectedCategory)?.label ?? 'Posts'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Refresh
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading posts…</p>
                    ) : !posts || posts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No posts yet. Be the first to share something!
                        </p>
                    ) : (
                        <ul className="space-y-3" role="list">
                            {posts.map(post => (
                                <li
                                    key={post.id}
                                    className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">
                                                    {post.author.firstName && post.author.lastName
                                                        ? `${post.author.firstName} ${post.author.lastName}`
                                                        : post.author.username}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    @{post.author.username}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {
                                                CATEGORIES.find(c => c.id === (post as { category?: string }).category)
                                                    ?.label ?? (post as { category?: string }).category ?? 'General'
                                            }
                                        </span>
                                    </div>

                                    <h3 className="mt-3 font-heading text-sm font-semibold">
                                        {post.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {post.description}
                                    </p>

                                    {post.imageUrl ? (
                                        <div className="mt-4 overflow-hidden rounded-md border border-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={post.imageUrl}
                                                alt={post.title}
                                                className="max-h-96 w-full object-cover"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="mt-3 text-xs text-muted-foreground">
                                        {post.likesCount} like{post.likesCount === 1 ? '' : 's'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </section>
        </main>
        {isModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-post-title"
                    className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-lg"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 id="create-post-title" className="font-heading text-base font-semibold">
                                Create a post
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Draft your post and optionally attach an image.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormErrorMessage(null);
                                setFormErrors({});
                                setImageError(null);
                            }}
                            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>

                    <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium">
                                Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formValues.title}
                                onChange={handleFieldChange}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            {formErrors.title ? (
                                <p className="mt-1 text-xs text-destructive">{formErrors.title}</p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formValues.description}
                                onChange={handleFieldChange}
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            {formErrors.description ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {formErrors.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium">
                                    Image (optional)
                                </label>
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent-foreground hover:file:bg-accent/90"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    PNG, JPG or WebP, up to 5MB.
                                </p>
                                {imageError ? (
                                    <p className="mt-1 text-xs text-destructive">{imageError}</p>
                                ) : null}
                                {imagePreview ? (
                                    <div className="mt-2 overflow-hidden rounded-md border border-border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imagePreview}
                                            alt="Selected image preview"
                                            className="max-h-48 w-full object-cover"
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formValues.category}
                                    onChange={handleFieldChange}
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.category ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {formErrors.category}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {formErrorMessage ? (
                            <p className="text-sm text-destructive">{formErrorMessage}</p>
                        ) : null}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createPost.isPending}
                                className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {createPost.isPending ? 'Posting…' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : null}
        </>
    );
}

