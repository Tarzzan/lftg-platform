import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject } from 'rxjs';

export interface NotificationEvent {
  id: string;
  type: 'workflow' | 'stock' | 'animal' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  entityId?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly subjects = new Map<string, Subject<NotificationEvent>>();
  private readonly globalSubject = new Subject<NotificationEvent>();

  /**
   * Subscribe to SSE events for a specific user (or global)
   */
  subscribe(userId?: string) {
    if (userId) {
      if (!this.subjects.has(userId)) {
        this.subjects.set(userId, new Subject<NotificationEvent>());
      }
      return this.subjects.get(userId)!.asObservable();
    }
    return this.globalSubject.asObservable();
  }

  /**
   * Emit a notification to a specific user or globally
   */
  emit(event: Omit<NotificationEvent, 'id' | 'timestamp'>, targetUserId?: string) {
    const notification: NotificationEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    if (targetUserId && this.subjects.has(targetUserId)) {
      this.subjects.get(targetUserId)!.next(notification);
    }
    // Always emit globally too
    this.globalSubject.next(notification);
  }

  /**
   * Listen to workflow transitions and emit SSE notifications
   */
  @OnEvent('workflow.transitioned')
  handleWorkflowTransition(payload: {
    instanceId: string;
    definitionId: string;
    entityId: string;
    fromState: string;
    toState: string;
    transition: string;
    userId: string;
  }) {
    const stateLabels: Record<string, string> = {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      cancelled: 'Annulé',
      in_progress: 'En cours',
      completed: 'Terminé',
    };

    this.emit({
      type: 'workflow',
      title: "Workflow mis à jour",
      message: `Transition : ${stateLabels[payload.fromState] ?? payload.fromState} → ${stateLabels[payload.toState] ?? payload.toState}`,
      severity: payload.toState === 'approved' ? 'success' : payload.toState === 'rejected' ? 'error' : 'info',
      entityId: payload.instanceId,
      userId: payload.userId,
      metadata: payload,
    });
  }

  /**
   * Emit a stock alert notification
   */
  emitStockAlert(item: { id: string; name: string; quantity: number; lowStockThreshold: number; unit: string }) {
    this.emit({
      type: 'stock',
      title: "Alerte stock faible",
      message: `${item.name} : ${item.quantity} ${item.unit} restant(s) (seuil : ${item.lowStockThreshold})`,
      severity: item.quantity === 0 ? 'error' : 'warning',
      entityId: item.id,
      metadata: item,
    });
  }
}
