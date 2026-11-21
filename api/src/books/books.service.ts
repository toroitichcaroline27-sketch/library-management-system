import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(genreId?: string, search?: string, page?: string, limit?: string) {
    // Query-string values arrive as strings, so convert and sanity-check them.
    const genreIdNum = genreId ? Number(genreId) : undefined;
    if (genreIdNum !== undefined && !Number.isInteger(genreIdNum)) {
      throw new BadRequestException('genreId must be an integer');
    }

    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit ?? '10', 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: Prisma.BookWhereInput = {
      ...(genreIdNum !== undefined && { genreId: genreIdNum }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { title: 'asc' },
        skip,
        take,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        data: dto,
        include: { genre: true },
      });
    } catch (e) {
      this.handlePrismaError(e, dto);
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id); // 404 if missing
    try {
      return await this.prisma.book.update({
        where: { id },
        data: dto,
        include: { genre: true },
      });
    } catch (e) {
      this.handlePrismaError(e, dto);
    }
  }

  async remove(id: number) {
    await this.findOne(id); // 404 if missing
    return this.prisma.book.delete({ where: { id } });
  }

  private handlePrismaError(e: unknown, dto: UpdateBookDto): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new ConflictException(`A book with ISBN "${dto.isbn}" already exists`);
      }
      if (e.code === 'P2003') {
        throw new BadRequestException(`Genre ${dto.genreId} does not exist`);
      }
    }
    throw e;
  }
}
