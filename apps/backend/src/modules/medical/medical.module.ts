import { Module } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { MedicalController } from './medical.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MedicalController],
  providers: [MedicalService],
  exports: [MedicalService],
})
export class MedicalModule {}
