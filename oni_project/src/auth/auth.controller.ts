import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    async signup(@Body() body: { fullName?: string; name?: string; email: string; password: string }) {
        // normalize incoming payload: accept either `fullName` or `name`
        const fullName = body.fullName ?? body.name ?? '';
        return this.authService.signup({ fullName, email: body.email, password: body.password });
    }

    @Post("login")
    async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, 
            sameSite: 'lax',
        });

        return { user: result.user };
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return { ok: true };
    }

    @Get('me')
    async me(@Req() req: Request) {
      const token = (req as any).cookies?.token;
      if (!token) return { user: null };
      const user = await this.authService.getUserFromToken(token);
      return { user };
    }
}
