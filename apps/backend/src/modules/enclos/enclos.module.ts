import { Module } from '@nestjs/common';
import { EnclosService } from './enclos.service';
import { EnclosController } from './enclos.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuditModule, NotificationsModule],
  controllers: [EnclosController],
  providers: [EnclosService],
  exports: [EnclosService],
})
export class EnclosModule {}
