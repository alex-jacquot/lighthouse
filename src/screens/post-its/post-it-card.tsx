'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import type { RouterOutputs } from '@/trpc/client';
import { cn } from '@/lib/utils';

type PostIt = RouterOutputs['postIt']['list'][number];

const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-200 border-yellow-400',
    pink: 'bg-pink-200 border-pink-400',
    blue: 'bg-blue-200 border-blue-400',
    green: 'bg-green-200 border-green-400',
};

interface PostItCardProps {
    postIt: PostIt;
}

export function PostItCard({ postIt }: PostItCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(postIt.title);
    const [editContent, setEditContent] = useState(postIt.content);
    const utils = trpc.useUtils();
    const update = trpc.postIt.update.useMutation({
        onSuccess: () => {
            void utils.postIt.list.invalidate();
            setIsEditing(false);
        },
    });
    const remove = trpc.postIt.delete.useMutation({
        onSuccess: () => void utils.postIt.list.invalidate(),
    });

    const colorClass = colorMap[postIt.color] ?? colorMap.yellow;

    function handleSave() {
        if (editTitle.trim() === postIt.title && editContent === postIt.content) {
            setIsEditing(false);
            return;
        }
        if (!editTitle.trim()) return;
        update.mutate({
            id: postIt.id,
            data: { title: editTitle.trim(), content: editContent },
        });
    }

    return (
        <article
            className={cn(
                'rounded-lg border-2 p-4 shadow-sm',
                colorClass
            )}
            aria-label={`Post-it: ${postIt.title}`}
        >
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded border border-gray-400 bg-white/80 px-2 py-1 text-sm font-medium"
                        maxLength={200}
                        aria-label="Edit title"
                    />
                    <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded border border-gray-400 bg-white/80 px-2 py-1 text-sm"
                        maxLength={2000}
                        aria-label="Edit content"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={update.isPending}
                            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditTitle(postIt.title);
                                setEditContent(postIt.content);
                                setIsEditing(false);
                            }}
                            className="rounded bg-gray-300 px-2 py-1 text-xs hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="font-medium">{postIt.title}</h2>
                    {postIt.content ? (
                        <p className="mt-1 text-sm text-gray-700">{postIt.content}</p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-xs underline hover:no-underline"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => remove.mutate({ id: postIt.id })}
                            disabled={remove.isPending}
                            className="text-xs text-red-700 underline hover:no-underline disabled:opacity-50"
                            aria-label={`Delete ${postIt.title}`}
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </article>
    );
}
