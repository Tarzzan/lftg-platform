import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
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
// PersonnelModule est géré par PluginsModule (plugins/personnel) — pas d'import direct
import { ReportsModule } from './modules/reports/reports.module';
// Phase 7
import { MessagingModule } from './modules/messaging/messaging.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ElevageModule } from './modules/elevage/elevage.module';
import { BiModule } from './modules/bi/bi.module';
import { SmsModule } from './modules/sms/sms.module';
import { AccountingModule } from './modules/accounting/accounting.module';
// Phase 8
import { WebsocketModule } from './modules/websocket/websocket.module';
import { TourismeModule } from './modules/tourisme/tourisme.module';
import { KiosqueModule } from './modules/kiosque/kiosque.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { PrevisionsModule } from './modules/previsions/previsions.module';
import { CitesApiModule } from './modules/cites-api/cites-api.module';
// Phase 9
import { StripeModule } from './modules/stripe/stripe.module';
import { MeteoModule } from './modules/meteo/meteo.module';
import { PartnersModule } from './modules/partners/partners.module';
import { GbifModule } from './modules/gbif/gbif.module';
import { SyncModule } from './modules/sync/sync.module';
// Phase 10
import { AlertesModule } from './modules/alertes/alertes.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { GpsModule } from './modules/gps/gps.module';
import { ParrainageModule } from './modules/parrainage/parrainage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
// Phase 11
import { IotModule } from './modules/iot/iot.module';
import { MlModule } from './modules/ml/ml.module';
import { GenealogyModule } from './modules/genealogy/genealogy.module';
import { SitesModule } from './modules/sites/sites.module';
import { PublicApiV2Module } from './modules/public-api-v2/public-api-v2.module';
import { AdvancedReportsModule } from './modules/advanced-reports/advanced-reports.module';
import { FcmModule } from './modules/fcm/fcm.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { RbacAccessModule } from './modules/rbac/rbac.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { AutoReportsModule } from './modules/auto-reports/auto-reports.module';
import { DemoModule } from './modules/demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        } as any),
        ttl: 300,
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-lang']),
      ],
    }),
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
    // PersonnelModule chargé via PluginsModule
    ReportsModule,
    // Phase 7
    MessagingModule,
    TicketsModule,
    ElevageModule,
    BiModule,
    SmsModule,
    AccountingModule,
    // Phase 8
    WebsocketModule,
    TourismeModule,
    KiosqueModule,
    QuizModule,
    PrevisionsModule,
    CitesApiModule,
    // Phase 9
    StripeModule,
    MeteoModule,
    PartnersModule,
    GbifModule,
    SyncModule,
    // Phase 10
    AlertesModule,
    NutritionModule,
    GpsModule,
    ParrainageModule,
    RealtimeModule,
    // Phase 11
    IotModule,
    MlModule,
    GenealogyModule,
    SitesModule,
    PublicApiV2Module,
    AdvancedReportsModule,
    FcmModule,
    WebhooksModule,
    RbacAccessModule,
    AnalyticsModule,
    GalleryModule,
    AutoReportsModule,
    DemoModule,
  ],
})
export class AppModule {}
