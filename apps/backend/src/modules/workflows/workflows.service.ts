import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // --- Definitions ---

  async findAllDefinitions() {
    return this.prisma.workflowDefinition.findMany({ orderBy: { name: 'asc' } });
  }

  async findDefinitionById(id: string) {
    const def = await this.prisma.workflowDefinition.findUnique({ where: { id } });
    if (!def) throw new NotFoundException(`WorkflowDefinition ${id} introuvable`);
    return def;
  }

  async createDefinition(data: {
    name: string;
    entityType: string;
    description?: string;
    states: Record<string, any>;
    transitions: Record<string, any>;
    formSchema?: Record<string, any>;
  }) {
    return this.prisma.workflowDefinition.create({ data });
  }

  async updateDefinition(id: string, data: Partial<{
    name: string;
    description: string;
    states: Record<string, any>;
    transitions: Record<string, any>;
    formSchema: Record<string, any>;
    isActive: boolean;
  }>) {
    await this.findDefinitionById(id);
    return this.prisma.workflowDefinition.update({ where: { id }, data });
  }

  // --- Instances ---

  async findAllInstances(filters?: { state?: string; assigneeId?: string; definitionId?: string }) {
    return this.prisma.workflowInstance.findMany({
      where: {
        ...(filters?.state && { currentState: filters.state }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
        ...(filters?.definitionId && { definitionId: filters.definitionId }),
      },
      include: { definition: true, assignee: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findInstanceById(id: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        definition: true,
        assignee: { select: { id: true, name: true, email: true } },
        history: { orderBy: { timestamp: 'asc' }, include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!instance) throw new NotFoundException(`WorkflowInstance ${id} introuvable`);
    return instance;
  }

  async createInstance(data: {
    definitionId: string;
    entityId: string;
    context?: Record<string, any>;
    assigneeId?: string;
  }) {
    const definition = await this.findDefinitionById(data.definitionId);
    const states = definition.states as Record<string, any>;
    const initialState = Object.entries(states).find(([, v]) => v.type === 'initial')?.[0];
    if (!initialState) throw new BadRequestException('Aucun état initial défini dans le workflow');

    return this.prisma.workflowInstance.create({
      data: {
        definitionId: data.definitionId,
        entityId: data.entityId,
        currentState: initialState,
        context: data.context || {},
        assigneeId: data.assigneeId,
      },
    });
  }

  async transition(instanceId: string, transitionName: string, userId: string, notes?: string, formData?: Record<string, any>) {
    const instance = await this.findInstanceById(instanceId);
    const transitions = instance.definition.transitions as Record<string, any>;
    const t = transitions[transitionName];

    if (!t) throw new BadRequestException(`Transition '${transitionName}' introuvable`);
    if (t.from !== instance.currentState && t.from !== '*') {
      throw new BadRequestException(
        `Transition '${transitionName}' impossible depuis l'état '${instance.currentState}'`,
      );
    }

    const fromState = instance.currentState;
    const toState = t.to;

    const [updated] = await this.prisma.$transaction([
      this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: {
          currentState: toState,
          context: { ...(instance.context as object), ...(formData || {}) },
        },
      }),
      this.prisma.workflowHistory.create({
        data: {
          instanceId,
          fromState,
          toState,
          transition: transitionName,
          userId,
          notes,
          formData: formData || {},
        },
      }),
    ]);

    this.eventEmitter.emit('workflow.transitioned', {
      instanceId,
      definitionId: instance.definitionId,
      entityId: instance.entityId,
      fromState,
      toState,
      transition: transitionName,
      userId,
    });

    return updated;
  }
}
