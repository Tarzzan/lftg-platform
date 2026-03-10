// @ts-nocheck
import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password: hashed },
    });
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
        roles: user.roles?.map((r: any) => r.name) ?? [],
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return { message: "Déconnexion réussie" };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { permissions: true } }, teams: true },
    });
    if (!user) throw new UnauthorizedException("Utilisateur introuvable");
    const { password: _, refreshToken: __, ...result } = user;
    return result;
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

  verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashedRefreshToken } });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_SECRET, expiresIn: '7d' }),
      this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET, expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  async generateTwoFactorSecret(userId: string) {
    // 2FA désactivé — retourne un message informatif
    return { message: "2FA non disponible dans cette version" };
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    return { message: "2FA non disponible dans cette version" };
  }
}
