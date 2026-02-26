'use client';

import { useState } from 'react';
import Image from 'next/image';
import { trpc } from '@/trpc/client';

export function AddFriendScreen() {
    const [query, setQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');

    const searchResult = trpc.user.search.useQuery(
        { query: submittedQuery || 'x' },
        {
            enabled: submittedQuery.trim().length > 0,
        }
    );

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        setSubmittedQuery(trimmed);
    }

    const users = searchResult.data ?? [];

    return (
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <h1 className="font-heading text-2xl font-bold">Add friends</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Search for people by name or username to find your friends on Lighthouse.
            </p>

            <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
                <input
                    type="search"
                    placeholder="Search by name or username…"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 sm:w-32"
                >
                    Search
                </button>
            </form>

            <section className="mt-6 space-y-3" aria-label="Search results">
                {searchResult.isLoading && submittedQuery ? (
                    <p className="text-sm text-muted-foreground">Searching for &ldquo;{submittedQuery}&rdquo;…</p>
                ) : null}

                {!searchResult.isLoading && submittedQuery && users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No users found matching &ldquo;{submittedQuery}&rdquo;.
                    </p>
                ) : null}

                {!submittedQuery ? (
                    <p className="text-sm text-muted-foreground">
                        Type a name or username above and press Search.
                    </p>
                ) : null}

                {users.length > 0 ? (
                    <ul className="divide-y divide-border rounded-md border border-border bg-card text-card-foreground" role="list">
                        {users.map(user => (
                            <li key={user.id} className="flex items-center gap-3 px-4 py-3">
                                <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                    {user.imageUrl ? (
                                        <Image
                                            src={user.imageUrl}
                                            alt={user.username}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                            {(user.firstName?.[0] ?? user.username[0] ?? 'U').toUpperCase()}
                                        </span>
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.username}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground opacity-70"
                                >
                                    Add friend (coming soon)
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </section>
        </main>
    );
}

