import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLACEHOLDER_AVATAR_BASE = 'https://placehold.co/256x256.png?text=User';

async function main() {
    const passwordHash = await bcrypt.hash('password123', 12);

    const firstNames = [
        'Alex',
        'Jordan',
        'Taylor',
        'Casey',
        'Riley',
        'Morgan',
        'Jamie',
        'Chris',
        'Sam',
        'Drew',
    ];

    const lastNames = [
        'Smith',
        'Johnson',
        'Lee',
        'Garcia',
        'Brown',
        'Martinez',
        'Davis',
        'Miller',
        'Wilson',
        'Lopez',
    ];

    const usersData = Array.from({ length: 50 }).map((_, index) => {
        const firstName = firstNames[index % firstNames.length];
        const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
        const username = `user${String(index + 1).padStart(3, '0')}`;

        return {
            username,
            firstName,
            lastName,
            passwordHash,
            imageUrl: `${PLACEHOLDER_AVATAR_BASE}+${encodeURIComponent(String(index + 1))}`,
        };
    });

    await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true,
    });

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        take: 30,
    });

    if (!users.length) return;

    const categories = ['general', 'tech', 'life', 'art', 'random'] as const;

    const sampleTitles = [
        'Just joined Lighthouse',
        'What I am working on today',
        'A thought about focus',
        'Small wins this week',
        'Looking for collaborators',
        'Sharing a favorite quote',
    ];

    const sampleDescriptions = [
        'Excited to try this new space for more intentional social sharing.',
        'Today I am focusing on deep work, fewer distractions, and one clear goal.',
        'Curious how others manage balance between work, learning, and rest.',
        'Dropping a quick update so future-me remembers where I started.',
        'If you are into TypeScript, design, or writing, let us connect.',
        'Sometimes the smallest steps forward matter the most.',
    ];

    const postsData: {
        title: string;
        description: string;
        imageUrl: string;
        category: string;
        authorId: string;
    }[] = [];

    users.forEach((user, userIndex) => {
        const postsPerUser = 2;

        for (let i = 0; i < postsPerUser; i += 1) {
            const title = sampleTitles[(userIndex + i) % sampleTitles.length];
            const description = sampleDescriptions[(userIndex * 2 + i) % sampleDescriptions.length];
            const category = categories[(userIndex + i) % categories.length];

            const imageUrl = `https://picsum.photos/seed/post-${userIndex + 1}-${i + 1}/1200/630`;

            postsData.push({
                title,
                description,
                imageUrl,
                category,
                authorId: user.id,
            });
        }
    });

    if (postsData.length) {
        await prisma.post.createMany({
            data: postsData,
            skipDuplicates: true,
        });
    }
}

main()
    .catch(error => {
        console.error('Error while seeding database', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

