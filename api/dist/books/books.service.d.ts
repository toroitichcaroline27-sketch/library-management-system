import { PrismaService } from '../prisma.service';
export declare class BooksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        genre: {
            id: number;
            name: string;
            slug: string;
        };
    } & {
        id: number;
        title: string;
        author: string;
        isbn: string;
        genreId: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
