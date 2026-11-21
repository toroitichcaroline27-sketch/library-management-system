import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Sample data. Safe to run again and again: every record is "upserted"
// (updated if it already exists, created if it does not). Nothing is deleted.
// ---------------------------------------------------------------------------

const genres = [
  { name: 'Wildlife & Safari', slug: 'wildlife-safari' },
  { name: 'Forestry & Ecosystems', slug: 'forestry-ecosystems' },
  { name: 'Savanna Conservation', slug: 'savanna-conservation' },
  { name: 'Technology', slug: 'technology' },
];

// Dev-only passwords for testing in Postman. Override via .env if you like.
const users = [
  { name: 'Head Librarian', email: 'librarian@ndovulibrary.com', role: Role.LIBRARIAN, password: process.env.SEED_LIBRARIAN_PASSWORD ?? 'Librarian123!' },
  { name: 'Library Patron', email: 'patron@ndovulibrary.com', role: Role.PATRON, password: process.env.SEED_PATRON_PASSWORD ?? 'Patron123!' },
];

// `genre` is the genre's slug. The seed turns it into a genreId below.
// Books in the first three genres are fictional sample titles (their ISBNs are
// samples). The Technology books are real titles with their real authors.
const books = [
  // Wildlife & Safari
  { title: 'The Maasai Mara Safari Guide', author: 'Conservation Kenya', isbn: '978-0201616221', genre: 'wildlife-safari' },
  { title: 'Tracking the Big Five', author: 'Juma Kariuki', isbn: '978-0201616222', genre: 'wildlife-safari' },
  { title: 'Mara River Migration', author: 'Sarah Lenana', isbn: '978-0201616223', genre: 'wildlife-safari' },
  { title: 'Savanna Predators and Prey', author: 'Dr. Caroline Omondi', isbn: '978-0201616225', genre: 'wildlife-safari' },

  // Forestry & Ecosystems
  { title: 'Secrets of the Forest and Savanna', author: 'David Kimani', isbn: '978-9966000035', genre: 'forestry-ecosystems' },
  { title: 'Canopy Dynamics in African Woodlands', author: 'Amina Hassan', isbn: '978-9966000036', genre: 'forestry-ecosystems' },
  { title: 'Rainforest Regeneration', author: 'Prof. Joseph Kariuki', isbn: '978-9966000037', genre: 'forestry-ecosystems' },
  { title: 'Root Systems and Soil Health', author: 'Esther Chebet', isbn: '978-9966000038', genre: 'forestry-ecosystems' },

  // Savanna Conservation
  { title: 'The Ndovu Chronicles: Guardians of the Savanna', author: 'Amani Jerono', isbn: '978-9966000828', genre: 'savanna-conservation' },
  { title: 'Elephant Corridors of East Africa', author: 'Abigael Yunge', isbn: '978-9966000829', genre: 'savanna-conservation' },
  { title: 'Acacia Trees and Grassland Balance', author: 'Sharon Kura', isbn: '978-9966000830', genre: 'savanna-conservation' },
  { title: 'Drought Resilience in Arid Lands', author: 'Paul Fundi', isbn: '978-9966000831', genre: 'savanna-conservation' },

  // Technology (real books, real authors)
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', isbn: '978-0201616224', genre: 'technology' },
  { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '978-0132350884', genre: 'technology' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', genre: 'technology' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0596517748', genre: 'technology' },
];

async function main() {
  // 1. Genres first: every book needs a genre that already exists.
  const genreIdBySlug = new Map<string, number>();
  for (const g of genres) {
    const row = await prisma.genre.upsert({
      where: { slug: g.slug },   // how to find an existing row
      update: { name: g.name },  // what to change if it exists
      create: g,                 // what to insert if it does not
    });
    genreIdBySlug.set(g.slug, row.id);
  }

  // 2. Users.
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: hash },
      create: { name: u.name, email: u.email, role: u.role, password: hash },
    });
  }

  // 3. Books. Matched by ISBN, which is unique.
  for (const b of books) {
    const genreId = genreIdBySlug.get(b.genre);
    if (genreId === undefined) {
      throw new Error(`Unknown genre slug "${b.genre}" for book "${b.title}"`);
    }
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: { title: b.title, author: b.author, genreId },
      create: { title: b.title, author: b.author, isbn: b.isbn, genreId },
    });
  }

  // 4. Report the TOTALS in the database. Running the seed twice must print the same numbers.
  const [genreCount, userCount, bookCount] = await Promise.all([
    prisma.genre.count(),
    prisma.user.count(),
    prisma.book.count(),
  ]);
  console.log(`Seed complete: ${genreCount} genres, ${bookCount} books, ${userCount} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });