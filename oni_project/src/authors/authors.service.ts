import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthorsService {
    constructor(private readonly prisma: PrismaService){}

    getAll(){
        return this.prisma.author.findMany();
    }
    createAuthor(data: Prisma.AuthorCreateInput){
        return this.prisma.author.create({
            data
        });
    }
    getAuthor(name: string){
        return this.prisma.author.findFirst({
            where: {name}
        });
    }
    updateAuthor(id: number, data: Prisma.AuthorUpdateInput){
        return this.prisma.author.update({
            where: {id},
            data
        });
    }
    deleteAuthor(id: number){
        return this.prisma.author.delete({
            where: {id}
        });
    }
    
}
