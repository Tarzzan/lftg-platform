import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { permissions: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((r: any) => r.name),
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    // Optionnel : ajouter le token à une blacklist Redis
    // await this.cacheManager.set(`blacklist_${accessToken}`, true, { ttl: 3600 });
    return { message: 'Déconnexion réussie' };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Accès refusé');
    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Accès refusé');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashedRefreshToken } });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_SECRET, expiresIn: '15m' }),
      this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  
  async generateTwoFactorSecret(userId: string) {
    const secret = speakeasy.generateSecret({ name: `LFTG Platform (${userId})` });
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });
    return qrcode.toDataURL(secret.otpauth_url);
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.twoFactorSecret) throw new ConflictException('2FA non activé');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) throw new UnauthorizedException('Token 2FA invalide');

    await this.prisma.user.update({ where: { id: userId }, data: { isTwoFactorEnabled: true } });
    return { message: '2FA activé avec succès' };
  }
}
