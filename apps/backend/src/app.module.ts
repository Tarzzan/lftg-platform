import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditModule } from './modules/audit/audit.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportModule } from './modules/export/export.module';
import { StatsModule } from './modules/stats/stats.module';
// Phase 3
import { MedicalModule } from './modules/medical/medical.module';
import { EmailModule } from './modules/email/email.module';
import { ImportModule } from './modules/import/import.module';
// Phase 4
import { EnclosModule } from './modules/enclos/enclos.module';
import { VentesModule } from './modules/ventes/ventes.module';
// Phase 5
import { SearchModule } from './modules/search/search.module';
import { PushModule } from './modules/push/push.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { CitesModule } from './modules/cites/cites.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { HistoryModule } from './modules/history/history.module';
// Phase 6
import { PersonnelModule } from './modules/personnel/personnel.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditModule,
    WorkflowsModule,
    PluginsModule,
    NotificationsModule,
    ExportModule,
    StatsModule,
    // Phase 3
    MedicalModule,
    EmailModule,
    ImportModule,
    // Phase 4
    EnclosModule,
    VentesModule,
    // Phase 5
    SearchModule,
    PushModule,
    AgendaModule,
    CitesModule,
    DocumentsModule,
    HistoryModule,
    // Phase 6
    PersonnelModule,
    ReportsModule,
  ],
})
export class AppModule {}
