import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const usersSeed = [
  {
    name: 'user 1',
  },
  {
    name: 'user 2',
  },
  {
    name: 'user 3',
  },
  {
    name: 'user 4',
  },
  {
    name: 'user 5',
  },
  {
    name: 'user 6',
  },
  {
    name: 'user 7',
  },
  {
    name: 'user 8',
  },
];

async function main() {
  for (const { name } of usersSeed) {
    await prisma.user.create({
      data: {
        name,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
