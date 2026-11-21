import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

// "Wildlife & Safari" -> "wildlife-safari"
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: { name: dto.name, slug: slugify(dto.name) },
      });
    } catch (e) {
      this.rethrowUnique(e, dto.name);
    }
  }

  findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id); // 404 if missing
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name, slug: slugify(dto.name) }),
        },
      });
    } catch (e) {
      this.rethrowUnique(e, dto.name);
    }
  }

  async remove(id: number) {
    await this.findOne(id); // 404 if missing
    try {
      return await this.prisma.genre.delete({ where: { id } });
    } catch (e) {
      // P2003 = foreign key violation: books still point at this genre
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          `Genre ${id} still has books. Move or delete them first.`,
        );
      }
      throw e;
    }
  }

  private rethrowUnique(e: unknown, name?: string): never {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new ConflictException(`Genre "${name}" already exists`);
    }
    throw e;
  }
}
