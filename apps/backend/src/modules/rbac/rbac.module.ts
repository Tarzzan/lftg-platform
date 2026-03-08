/**
 * RbacAccessModule — Gestion des rôles et permissions
 *
 * Implémentation native sans dépendance externe.
 * Les rôles et permissions sont gérés via Prisma (PermissionsGuard).
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [PrismaModule],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacAccessModule {}
