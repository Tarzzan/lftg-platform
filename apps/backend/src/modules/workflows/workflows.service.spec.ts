import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../prisma/prisma.service';

const mockDefinition = {
  id: 'def-1',
  name: 'Test Workflow',
  entityType: 'TestEntity',
  states: {
    draft: { type: 'initial', label: "Brouillon' },
    pending: { label: "En attente' },
    approved: { type: 'final', label: "Approuvé' },
  },
  transitions: {
    submit: { from: "draft', to: 'pending', label: "Soumettre' },
    approve: { from: "pending', to: 'approved', label: "Approuver' },
  },
};

const mockInstance = {
  id: "inst-1',
  definitionId: 'def-1',
  definition: mockDefinition,
  entityId: 'entity-1',
  currentState: 'draft',
  context: {},
  assigneeId: null,
  history: [],
  assignee: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  workflowDefinition: {
    findMany: jest.fn().mockResolvedValue([mockDefinition]),
    findUnique: jest.fn().mockResolvedValue(mockDefinition),
    create: jest.fn(),
    update: jest.fn(),
  },
  workflowInstance: {
    findMany: jest.fn().mockResolvedValue([mockInstance]),
    findUnique: jest.fn().mockResolvedValue(mockInstance),
    create: jest.fn().mockResolvedValue(mockInstance),
    update: jest.fn().mockResolvedValue({ ...mockInstance, currentState: 'pending' }),
  },
  workflowHistory: {
    create: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((ops) => Promise.all(ops)),
};

const mockEventEmitter = { emit: jest.fn() };

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    jest.clearAllMocks();
    mockPrisma.workflowDefinition.findUnique.mockResolvedValue(mockDefinition);
    mockPrisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
  });

  describe('createInstance', () => {
    it('should create an instance starting from the initial state', async () => {
      await service.createInstance({ definitionId: 'def-1', entityId: 'entity-1' });
      expect(mockPrisma.workflowInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentState: 'draft' }) }),
      );
    });

    it('should throw NotFoundException for unknown definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValue(null);
      await expect(service.createInstance({ definitionId: 'unknown', entityId: 'e-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transition', () => {
    it('should apply a valid transition', async () => {
      mockPrisma.$transaction.mockResolvedValue([{ ...mockInstance, currentState: 'pending' }, {}]);
      const result = await service.transition('inst-1', 'submit', 'user-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('workflow.transitioned', expect.any(Object));
    });

    it('should throw BadRequestException for unknown transition', async () => {
      await expect(service.transition('inst-1', 'unknown_transition', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      await expect(service.transition('inst-1', 'approve', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
