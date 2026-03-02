import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
  });

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ─── Validation globale ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Préfixe API ───────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs', '/docs-json'],
  });

  // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('🦜 LFTG Platform API')
    .setDescription(`
## API REST de La Ferme Tropicale de Guyane

Cette API REST fournit tous les endpoints nécessaires pour gérer la plateforme LFTG :
animaux, enclos, couvées, stock, personnel, formations, workflows, ventes et suivi médical.

### Authentification
Utilisez le endpoint \`/api/v1/auth/login\` pour obtenir un token JWT, puis incluez-le
dans l'en-tête \`Authorization: Bearer <token>\` pour toutes les requêtes protégées.

### Comptes de test
- **Admin** : \`admin@lftg.fr\` / \`Admin1234!\`
- **Soigneur** : \`soigneur@lftg.fr\` / \`User1234!\`

### Versions
| Version | Statut | Description |
|---------|--------|-------------|
| v1.0.0 | Stable | Fondations — Auth, RBAC, Plugins, Workflows |
| v2.0.0 | Stable | SSE, Export CSV/PDF, Stats |
| v3.0.0 | Stable | Module médical, Email, Import CSV |
| v4.0.0 | Stable | Enclos, Ventes, Swagger complet |
| v15.0.0 | Actuel | Consolidation — Dépendances, Docker, RBAC, CRUD |
    `)
    .setVersion("15.0.0")
    .setContact('LFTG Team', 'https://github.com/Tarzzan/lftg-platform', 'admin@lftg.fr')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtenu via /api/v1/auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification et gestion des sessions')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Roles', 'Rôles et permissions RBAC/ABAC')
    .addTag('Animaux & Couvées', 'Gestion des animaux et des couvées')
    .addTag('Enclos', 'Gestion des enclos avec géolocalisation')
    .addTag('Médical', 'Suivi médical vétérinaire')
    .addTag('Stock', 'Gestion du stock et des articles')
    .addTag('Ventes', 'Gestion des ventes et facturation')
    .addTag('Formation', 'LMS — Cours, cohortes et inscriptions')
    .addTag('Personnel', 'Gestion RH des employés')
    .addTag('Workflows', 'Moteur de workflows métier')
    .addTag('Notifications', 'SSE — Notifications temps réel')
    .addTag('Export', 'Export CSV et rapports PDF')
    .addTag('Import', 'Import CSV en masse')
    .addTag('Stats', 'Statistiques et tableaux de bord')
    .addTag('Audit', 'Journal d\'audit des actions')
    .addServer('http://localhost:3001', 'Développement local')
    .addServer('https://api.lftg.fr', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: { theme: 'monokai' },
    },
    customSiteTitle: '🦜 LFTG Platform API Docs',
    customCss: `
      .swagger-ui .topbar { background: #166534; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #166534; }
    `,
  });

  // ─── Health check ──────────────────────────────────────────────────────────
  app.getHttpAdapter().get("/health", (_req: any, res: any) => {
    res.json({
      status: "ok",
      version: "15.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🦜 LFTG Platform API v15.0.0 démarrée sur http://localhost:${port}`);
  logger.log(`📚 Documentation Swagger : http://localhost:${port}/docs`);
  logger.log(`🏥 Health check : http://localhost:${port}/health`);
}

bootstrap();
