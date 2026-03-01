import { Module } from '@nestjs/common';
import { RBACModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBACModule.forShare({
      roles: ['admin', 'soigneur', 'veterinaire', 'visiteur'],
      permissions: {
        animals: ['create', 'read', 'update', 'delete'],
        enclosures: ['create', 'read', 'update', 'delete'],
        medical: ['create', 'read', 'update'],
        users: ['create', 'read', 'update', 'delete'],
      },
      grants: {
        visiteur: ['animals_read', 'enclosures_read'],
        soigneur: ['visiteur', 'medical_read'],
        veterinaire: ['soigneur', 'medical_create', 'medical_update'],
        admin: ['veterinaire', 'users', 'animals_delete', 'enclosures_delete'],
      },
    }),
  ],
})
export class RbacAccessModule {}
