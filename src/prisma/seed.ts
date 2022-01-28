import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    email: 'zax4r0',
    firstName: 'zax4r0',
    lastName: 'zax4r0',
    password: 'zax4r0@123',
    username: 'zax4r0',
    posts: {
      create: [
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: true,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: true,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: false,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: false,
        },
      ],
    },
  },
  {
    email: 'sagar',
    firstName: 'sagar',
    lastName: 'sagar',
    password: 'sagar@123',
    username: 'sagar',
    posts: {
      create: [
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: true,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: true,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: false,
        },
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          isPublished: false,
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
