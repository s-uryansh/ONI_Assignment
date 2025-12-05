import { Controller, Post, Put, Delete, Get, Body, Param, ParseIntPipe, Query, Req, UnauthorizedException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { CookieToken } from 'src/utils/jwt';
@Controller('books')
export class BooksController {
    constructor(
      private readonly BooksService: BooksService,
      private readonly authService: AuthService,
    ) {}

    @Get("all")
    getBooks(
        @Query('title') title?: string,
        @Query('author') author?: string,
        @Query('available') available?: string,
    ) {
        const filters: any = {};
        if (title) filters.title = title;
        if (author) filters.author = author;
        if (typeof available !== 'undefined') {
            filters.available = available === 'true' || available === '1';
        }
        return this.BooksService.getAll(Object.keys(filters).length ? filters : undefined);
    }

    @Post()
    async createBook(@Body() body: Prisma.BookCreateInput, @Req() req: Request) {
        return this.BooksService.createBook(body);
    }
    @Get(":title")
    getBook(@Param("title") title: string) {
        return this.BooksService.getBook(title);
    }
    @Put(":id")
    async updateBook(@Param("id", ParseIntPipe) id: number, @Body() body: Prisma.BookUpdateInput, @Req() req: Request) {
        return this.BooksService.updateBook(id, body);
    }
    @Delete(":id")
    async deleteBook(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return this.BooksService.deleteBook(id);
    }
    @Get("borrowed/user/:user_id")
    async fetchBorrowedByUser(@Param("user_id", ParseIntPipe) user_id: number, @Req() req: Request) {
        return this.BooksService.getBorrowedByUser(user_id);
    }
    @Post("borrow/:book_id/:user_id")
    async borrowBook(
        @Param("book_id", ParseIntPipe) book_id: number, 
        @Param("user_id", ParseIntPipe) user_id: number,
        @Req() req: Request,
    ) {
        return this.BooksService.borrowBook(book_id, user_id);
    }
    @Post("return/:book_id")
    async returnBook(@Param("book_id", ParseIntPipe) book_id: number, @Req() req: Request) {
        return this.BooksService.returnBook(book_id);
    }
    @Get("borrowed/all")
    async fetchBorrowedBooks(@Req() req: Request) {
        return this.BooksService.fetchBorrowedBooks();
    }
}
