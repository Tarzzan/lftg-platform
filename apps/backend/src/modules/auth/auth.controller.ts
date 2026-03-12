// @ts-nocheck
import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Response } from 'express';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  async login(@Request() req: any, @Body() _dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'strict' });
    return { accessToken: tokens.accessToken, user: tokens.user };
  }
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rafraichir le token' })
  async refreshToken(@Request() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const { sub } = this.authService.verifyRefreshToken(refreshToken);
    const tokens = await this.authService.refreshTokens(sub, refreshToken);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'strict' });
    return { accessToken: tokens.accessToken };
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deconnexion utilisateur' })
  async logout(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Deconnexion reussie' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil utilisateur connecte' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generer un secret 2FA' })
  async generateTwoFactorSecret(@CurrentUser('id') userId: string) {
    const qrCodeDataUrl = await this.authService.generateTwoFactorSecret(userId);
    return { qrCodeDataUrl };
  }
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verifier un token 2FA' })
  async verifyTwoFactorToken(@CurrentUser('id') userId: string, @Body('token') token: string) {
    return this.authService.verifyTwoFactorToken(userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('impersonate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: obtenir un token pour simuler un utilisateur' })
  async impersonate(
    @CurrentUser('id') adminId: string,
    @Body('userId') targetUserId: string,
  ) {
    return this.authService.impersonate(adminId, targetUserId);
  }

}