import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const criteriaData = [
        { text: "Hi, How are you?" },
        { text: "What are the good qualities you have?" },
        { text: "How do you rate your problem-solving skills?" }
    ];

    for (const criteria of criteriaData) {
        await prisma.criteria.create({ data: criteria });
    }

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
