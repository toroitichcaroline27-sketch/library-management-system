import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing records to avoid unique constraint collisions
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Genres (At least 4 required)
  const wildlife = await prisma.genre.create({
    data: { name: 'Wildlife & Safari', slug: 'wildlife-safari' },
  });

  const forest = await prisma.genre.create({
    data: { name: 'Forestry & Ecosystems', slug: 'forestry-ecosystems' },
  });

  const savanna = await prisma.genre.create({
    data: { name: 'Savanna Conservation', slug: 'savanna-conservation' },
  });

  const technology = await prisma.genre.create({
    data: { name: 'Technology', slug: 'technology' },
  });

  // 2. Create Users (Patron & Librarian roles)
  await prisma.user.create({
    data: { email: 'librarian@ndovulibrary.com', role: 'LIBRARIAN' },
  });

  await prisma.user.create({
    data: { email: 'patron@ndovulibrary.com', role: 'PATRON' },
  });

  // 3. Create Books (At least 15 books distributed across genres)
  const booksData = [
    // Wildlife & Safari (4 books)
    { title: 'The Maasai Mara Safari Guide', author: 'Conservation Kenya', isbn: '978-0201616221', genreId: wildlife.id },
    { title: 'Tracking the Big Five', author: 'Juma Kariuki', isbn: '978-0201616222', genreId: wildlife.id },
    { title: 'Mara River Migration', author: 'Sarah Lenana', isbn: '978-0201616223', genreId: wildlife.id },
    { title: 'Savanna Predators and Prey', author: 'Dr. Caroline Omondi', isbn: '978-0201616225', genreId: wildlife.id },

    // Forestry & Ecosystems (4 books)
    { title: 'Secrets of the Forest and Savanna', author: 'David Kimani', isbn: '978-9966000035', genreId: forest.id },
    { title: 'Canopy Dynamics in African Woodlands', author: 'Amina Hassan', isbn: '978-9966000036', genreId: forest.id },
    { title: 'Rainforest Regeneration', author: 'Prof. Kariuki', isbn: '978-9966000037', genreId: forest.id },
    { title: 'Root Systems and Soil Health', author: 'Toroitich Miss', isbn: '978-9966000038', genreId: forest.id },

    // Savanna Conservation (4 books)
    { title: 'The Ndovu Chronicles: Guardians of the Savanna', author: 'Amani Jerono', isbn: '978-9966000828', genreId: savanna.id },
    { title: 'Elephant Corridors of East Africa', author: 'Abigael Yunge', isbn: '978-9966000829', genreId: savanna.id },
    { title: 'Acacia Trees and Grassland Balance', author: 'Sharon Kura', isbn: '978-9966000830', genreId: savanna.id },
    { title: 'Drought Resilience in Arid Lands', author: 'Paul F.', isbn: '978-9966000831', genreId: savanna.id },

    // Technology (4 books)
    { title: 'The Pragmatic Programmer', author: 'Andrew Choge', isbn: '978-0201616224', genreId: technology.id },
    { title: 'Clean Code: A Handbook of Agile Craftsmanship', author: 'Robert Wanjiru', isbn: '978-0132350884', genreId: technology.id },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Mutheo', isbn: '978-1449373328', genreId: technology.id },
    { title: 'NestJS Architecture Patterns', author: 'Kami Esbon', isbn: '978-1449373329', genreId: technology.id },
  ];

  for (const book of booksData) {
    await prisma.book.create({ data: book });
  }

  console.log('Seeded successfully with 4 genres and 16 books!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });