import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('social/:provider')
  @UseGuards(AuthGuard('google'))
  async socialAuth(@Req() req: Request) {
    // This endpoint will be handled by the Passport strategy
  }

  @Get('social/:provider/callback')
  @UseGuards(AuthGuard('google'))
  async socialAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { user, idToken } = req.user as any;
    const result = await this.authService.handleSocialLogin(
      user.email,
      user.name,
      user.provider,
      idToken,
    );

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
