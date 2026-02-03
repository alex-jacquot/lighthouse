import Link from 'next/link';

export function SignupScreen() {
    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Sign up</h1>
            <p className="mt-2 text-muted-foreground">
                Registration will be implemented here.
            </p>
            <Link href="/" className="mt-6 inline-block text-accent hover:underline">
                ← Back to home
            </Link>
        </main>
    );
}
