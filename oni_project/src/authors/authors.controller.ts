import { Controller, Post, Put, Delete, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Prisma } from '@prisma/client';


@Controller('authors')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @Get("all")
    getAuthors() {
        return this.authorsService.getAll();
    }
    @Post()
    createAuthor(@Body() body: Prisma.AuthorCreateInput) {
        return this.authorsService.createAuthor(body);
    }
    @Get(":name")
    getAuthor(@Param("name") name: string) {
        return this.authorsService.getAuthor(name);
    }
    @Put(":id")
    updateAuthor(@Param("id", ParseIntPipe) id: number, @Body() body: Prisma.AuthorUpdateInput) {
        return this.authorsService.updateAuthor(id, body);
    }
    @Delete(":id")
    deleteAuthor(@Param("id", ParseIntPipe) id: number) {
        return this.authorsService.deleteAuthor(id);
    }
}
