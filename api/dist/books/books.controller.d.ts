import { BooksService } from './books.service';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
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
