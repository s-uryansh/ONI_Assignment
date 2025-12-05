import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { encodePassword, comparePassword } from 'src/utils/bcrypt';
import { generateToken, verifyToken } from 'src/utils/jwt';
import type { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    async signup(data: { fullName: string; email: string; password: string }) {
        data.password = await encodePassword(data.password);

        const user = await this.prisma.user.create({
            data: {
                name: data.fullName,
                email: data.email,
                password: data.password,
            },
        });
        return { id: user.id, fullName: user.name, email: user.email };
    }

    async login(data: {email: string; password: string}){
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if(!user){
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await comparePassword(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = generateToken(
            { id: user.id, email: user.email },
            process.env.SECRET_KEY || 'default_secret',
            '1h'
        );

        return {
            token,
            user:{
                id: user.id,
                fullName: user.name,
                email: user.email
            }
        }
        
    }

    async getUserFromToken(token: string) {
        if (!token) return null;
        const secret = process.env.SECRET_KEY || 'default_secret';
        const decoded = verifyToken(token, secret) as JwtPayload | null;
        if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) return null;
        const userId = Number((decoded as any).id);
        if (Number.isNaN(userId)) return null;
        const user = await this.prisma.user.findUnique({ where: { id: userId }});
        if (!user) return null;
        return { id: user.id, fullName: user.name, email: user.email };
    }
}
