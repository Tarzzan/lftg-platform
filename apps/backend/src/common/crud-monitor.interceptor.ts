import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../modules/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const CRUD_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class CrudMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CrudMonitor');

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;
    const url = req.url as string;
    const startTime = Date.now();

    // Surveiller uniquement les opérations CRUD
    if (!CRUD_METHODS.includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - startTime;
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Enregistrer les succès CRUD dans l'audit log
        await this.logCrudEvent({
          method,
          url,
          statusCode,
          duration,
          userId: req.user?.id || null,
          success: true,
          errorMessage: null,
          requestBody: this.sanitizeBody(req.body),
        });
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        const errorEntry = {
          method,
          url,
          statusCode,
          duration,
          userId: req.user?.id || null,
          success: false,
          errorMessage: error.message || 'Erreur inconnue',
          requestBody: this.sanitizeBody(req.body),
          errorStack: error.stack?.substring(0, 500) || null,
        };

        // Enregistrer l'erreur
        await this.logCrudEvent(errorEntry);

        // Émettre un événement temps réel pour les erreurs critiques
        if (statusCode >= 500) {
          this.eventEmitter.emit('crud.error.critical', errorEntry);
          this.logger.error(
            `CRUD ERROR [${method}] ${url} → ${statusCode} (${duration}ms): ${error.message}`,
          );
        } else if (statusCode >= 400) {
          this.eventEmitter.emit('crud.error.warning', errorEntry);
          this.logger.warn(
            `CRUD WARNING [${method}] ${url} → ${statusCode} (${duration}ms): ${error.message}`,
          );
        }

        return throwError(() => error);
      }),
    );
  }

  private async logCrudEvent(data: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    userId: string | null;
    success: boolean;
    errorMessage: string | null;
    requestBody?: any;
    errorStack?: string | null;
  }) {
    try {
      await this.prisma.crudErrorLog.create({
        data: {
          method: data.method,
          url: data.url,
          statusCode: data.statusCode,
          duration: data.duration,
          userId: data.userId,
          success: data.success,
          errorMessage: data.errorMessage,
          requestBody: data.requestBody || {},
          errorStack: data.errorStack || null,
          section: this.extractSection(data.url),
        },
      });
    } catch (e) {
      // Ne pas faire planter l'app si le monitoring échoue
      this.logger.error(`Impossible d'enregistrer l'erreur CRUD: ${e.message}`);
    }
  }

  private extractSection(url: string): string {
    const segments = url.replace('/api/v1/', '').split('/');
    const sectionMap: Record<string, string> = {
      'plugins': segments[1] || 'plugins',
      'auth': 'Authentification',
      'users': 'Utilisateurs',
      'roles': 'Rôles',
      'medical': 'Médical',
      'stock': 'Stock',
      'personnel': 'Personnel',
      'enclos': 'Enclos',
      'workflows': 'Workflows',
      'documents': 'Documents',
      'ventes': 'Ventes',
      'formation': 'Formation',
    };

    const pluginSectionMap: Record<string, string> = {
      'animaux': 'Animaux',
      'personnel': 'Personnel',
      'stock': 'Stock',
      'formation': 'Formation',
    };

    if (segments[0] === 'plugins' && segments[1]) {
      return pluginSectionMap[segments[1]] || segments[1];
    }

    return sectionMap[segments[0]] || segments[0] || 'Autre';
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};
    const sanitized = { ...body };
    // Supprimer les champs sensibles
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
}
