'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { cn } from '@/lib/utils';

interface PostItFormProps {
    className?: string;
}

export function PostItForm({ className }: PostItFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const utils = trpc.useUtils();
    const create = trpc.postIt.create.useMutation({
        onSuccess: () => {
            void utils.postIt.list.invalidate();
            setTitle('');
            setContent('');
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        create.mutate({ title: title.trim(), content: content.trim() });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn('flex flex-col gap-2 sm:flex-row sm:items-end', className)}
            aria-label="Create post-it"
        >
            <div className="flex-1 space-y-1">
                <label htmlFor="postit-title" className="sr-only">
                    Title
                </label>
                <input
                    id="postit-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={200}
                    disabled={create.isPending}
                />
            </div>
            <div className="flex-1 space-y-1">
                <label htmlFor="postit-content" className="sr-only">
                    Content
                </label>
                <input
                    id="postit-content"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content (optional)"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={2000}
                    disabled={create.isPending}
                />
            </div>
            <button
                type="submit"
                disabled={create.isPending || !title.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
                {create.isPending ? 'Adding…' : 'Add'}
            </button>
        </form>
    );
}
