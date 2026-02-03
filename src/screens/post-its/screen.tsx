'use client';

import Link from 'next/link';
import { trpc } from '@/trpc/client';
import type { RouterOutputs } from '@/trpc/client';
import { PostItList } from './post-it-list';
import { PostItForm } from './post-it-form';

type PostIt = RouterOutputs['postIt']['list'][number];

interface PostItsScreenProps {
    initialPostIts: PostIt[];
}

export function PostItsScreen({ initialPostIts }: PostItsScreenProps) {
    const { data: postIts = initialPostIts } = trpc.postIt.list.useQuery(undefined, {
        initialData: initialPostIts,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex gap-2 text-sm text-muted-foreground">
                    <li>
                        <Link href="/" className="hover:text-foreground">
                            Home
                        </Link>
                    </li>
                    <li aria-current="page">Post-it notes</li>
                </ol>
            </nav>
            <h1 className="text-2xl font-bold">Post-it notes</h1>
            <p className="mt-1 text-muted-foreground">Create and manage notes.</p>
            <PostItForm className="mt-6" />
            <PostItList postIts={postIts} className="mt-8" />
        </main>
    );
}
