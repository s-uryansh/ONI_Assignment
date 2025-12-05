import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService){}

    getAll(filters?: { title?: string; author?: string; available?: boolean }) {
        const where: any = {};
        const and: any[] = [];
        if (filters) {
            if (filters.title) {
                and.push({ title: { contains: filters.title, mode: 'insensitive' } });
            }
            if (filters.author) {
                and.push({ author: { contains: filters.author, mode: 'insensitive' } });
            }
            if (typeof filters.available === 'boolean') {
                if (filters.available) {
                    and.push({ borrowedBy: null });
                } else {
                    and.push({ borrowedBy: { not: null } });
                }
            }
            if (and.length > 0) where.AND = and;
        }
        return this.prisma.book.findMany({ where });
    }

    createBook(data: Prisma.BookCreateInput){
        return this.prisma.book.create({
            data
        });
    }
    getBook(title: string){
        return this.prisma.book.findFirst({
            where: { title }
        });
    }
    updateBook(id: number, data: Prisma.BookUpdateInput){
        return this.prisma.book.update({
            where: {id},
            data
        });
    }
    deleteBook(id: number){
        return this.prisma.book.delete({
            where: {id}
        });
    }
    getBorrowedByUser(user_id: number) {
        return this.prisma.book.findMany({
            where: { borrowedBy: user_id }
        });
    }
    async borrowBook(book_id: number, user_id: number){
        const book = await this.prisma.book.findUnique({
            where: {id: book_id}
        });

        if(!book){
            throw new Error("Book not found");
        }
        if(book.borrowedBy !== null){
            throw new Error("Book already borrowed");
        }
        const user = await this.prisma.user.findUnique({
            where: {id: user_id}
        }); 
        if(!user){
            throw new Error("User not found");
        }
        return this.prisma.book.update({
            where: {id: book_id},
            data: {
                borrowedBy: user_id
            }
        });
    }

    async fetchBorrowedBooks(){
        return this.prisma.book.findMany({
            where: {
                borrowedBy: {
                    not: null
                }
            }
        });
    }

    async returnBook(book_id: number){
        const book = await this.prisma.book.findUnique({
            where: {id: book_id}
        });

        if(!book){
            throw new Error("Book not found");
        }
        if(book.borrowedBy === null){
            throw new Error("Book is not borrowed");
        }

        return this.prisma.book.update({
            where: {id: book_id},
            data: {
                borrowedBy: null
            }
        });
    }
}
