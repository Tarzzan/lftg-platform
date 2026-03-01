import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'user-1',
        email: 'test@lftg.fr',
        password: hashedPassword,
        isActive: true,
        roles: [],
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@lftg.fr', 'password123');
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@lftg.fr');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@lftg.fr',
        password: hashedPassword,
        isActive: true,
        roles: [],
      });

      await expect(service.validateUser('test@lftg.fr', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('notfound@lftg.fr', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@lftg.fr',
        password: hashedPassword,
        isActive: false,
        roles: [],
      });
      await expect(service.validateUser('test@lftg.fr', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return access_token and user info', async () => {
      const mockUser = { id: 'user-1', email: 'test@lftg.fr', name: 'Test', roles: [{ name: 'admin' }] };
      const result = await service.login(mockUser);
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user.roles).toEqual(['admin']);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });
      await expect(
        service.register({ email: 'existing@lftg.fr', password: 'Password1!' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user and return without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@lftg.fr',
        name: 'New User',
        password: 'hashed',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({ email: 'new@lftg.fr', password: 'Password1!' });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('new@lftg.fr');
    });
  });
});
