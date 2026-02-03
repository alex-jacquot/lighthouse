'use client';

import { trpc } from '@/trpc/client';
import type { RouterOutputs } from '@/trpc/client';
import { PostItCard } from './post-it-card';
import { cn } from '@/lib/utils';

type PostIt = RouterOutputs['postIt']['list'][number];

interface PostItListProps {
    postIts: PostIt[];
    className?: string;
}

export function PostItList({ postIts, className }: PostItListProps) {
    if (postIts.length === 0) {
        return (
            <p className={cn('text-muted-foreground', className)} aria-live="polite">
                No post-its yet. Create one above.
            </p>
        );
    }

    return (
        <ul className={cn('grid gap-4 sm:grid-cols-2', className)} aria-label="Post-it list">
            {postIts.map((postIt) => (
                <li key={postIt.id}>
                    <PostItCard postIt={postIt} />
                </li>
            ))}
        </ul>
    );
}
