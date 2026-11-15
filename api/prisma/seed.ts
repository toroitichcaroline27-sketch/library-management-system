
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to avoid conflicts
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Create Genres
  const fiction = await prisma.genre.create({
    data: { name: 'Fiction', slug: 'fiction' },
  });

  const technology = await prisma.genre.create({
    data: { name: 'Technology', slug: 'technology' },
  });

  const wildlife = await prisma.genre.create({
    data: { name: 'Wildlife & Safari', slug: 'wildlife-safari' },
  });

  // Create Sample Books
  await prisma.book.create({
    data: {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt and David Thomas',
      isbn: '978-0201616224',
      genreId: technology.id,
    },
  });

  await prisma.book.create({
    data: {
      title: 'The Maasai Mara Safari Guide',
      author: 'Conservation Kenya',
      isbn: '978-9966000011',
      genreId: wildlife.id,
    },
  });

  await prisma.book.create({
    data: {
      title: 'The Ndovu Chronicles: Guardians of the Savanna',
      author: 'Amina Wildlife',
      isbn: '978-9966000028',
      genreId: wildlife.id,
    },
  });

  await prisma.book.create({
    data: {
      title: 'Secrets of the Forest and Savanna',
      author: 'David K.',
      isbn: '978-9966000035',
      genreId: wildlife.id,
    },
  });

  // Create a Test User
  await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
  });

  console.log('Database seeding with Safari & Wildlife books completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });