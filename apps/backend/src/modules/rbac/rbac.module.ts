/**
 * RbacAccessModule — Gestion des rôles et permissions
 *
 * Implémentation native sans dépendance externe.
 * Les rôles et permissions sont gérés via Prisma (PermissionsGuard).
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [],
})
export class RbacAccessModule {}
