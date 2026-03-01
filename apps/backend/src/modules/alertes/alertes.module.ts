import { Module } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { AlertesController } from './alertes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AlertesController],
  providers: [AlertesService],
  exports: [AlertesService],
})
export class AlertesModule {}
