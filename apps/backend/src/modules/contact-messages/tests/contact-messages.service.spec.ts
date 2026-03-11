// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { ContactMessagesService } from '../contact-messages.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  contactMessage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  contactReply: {
    create: jest.fn(),
  },
};

describe('ContactMessagesService', () => {
  let service: ContactMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactMessagesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ContactMessagesService>(ContactMessagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact message with auto-generated reference', async () => {
      const data = { senderName: 'Alice', senderEmail: 'alice@test.fr', subject: 'Info', message: 'Bonjour' };
      const created = { id: '1', reference: 'MSG-ABC', ...data, status: 'UNREAD' };
      mockPrisma.contactMessage.create.mockResolvedValue(created);
      const result = await service.create(data);
      expect(result).toEqual(created);
      expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            senderName: 'Alice',
            senderEmail: 'alice@test.fr',
            status: 'UNREAD',
          }),
        })
      );
    });

    it('should generate a unique reference starting with MSG-', async () => {
      const data = { senderName: 'Bob', senderEmail: 'bob@test.fr', subject: 'Test', message: 'Test' };
      mockPrisma.contactMessage.create.mockImplementation(({ data }) => {
        expect(data.reference).toMatch(/^MSG-/);
        return Promise.resolve({ id: '2', ...data });
      });
      await service.create(data);
    });
  });

  describe('findAll', () => {
    it('should return all messages without filter', async () => {
      const messages = [{ id: '1' }, { id: '2' }];
      mockPrisma.contactMessage.findMany.mockResolvedValue(messages);
      const result = await service.findAll();
      expect(result).toEqual(messages);
      expect(mockPrisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined })
      );
    });

    it('should filter by status when provided', async () => {
      const messages = [{ id: '1', status: 'UNREAD' }];
      mockPrisma.contactMessage.findMany.mockResolvedValue(messages);
      const result = await service.findAll('UNREAD');
      expect(result).toEqual(messages);
      expect(mockPrisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'UNREAD' } })
      );
    });
  });

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      mockPrisma.contactMessage.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(3)   // unread
        .mockResolvedValueOnce(5)   // replied
        .mockResolvedValueOnce(2);  // archived
      const result = await service.getStats();
      expect(result).toEqual({ total: 10, unread: 3, replied: 5, archived: 2 });
    });

    it('should return zeros when no messages', async () => {
      mockPrisma.contactMessage.count.mockResolvedValue(0);
      const result = await service.getStats();
      expect(result.total).toBe(0);
      expect(result.unread).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('should update message status', async () => {
      const updated = { id: '1', status: 'REPLIED' };
      mockPrisma.contactMessage.update.mockResolvedValue(updated);
      const result = await service.updateStatus('1', 'REPLIED');
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      const deleted = { id: '1' };
      mockPrisma.contactMessage.delete.mockResolvedValue(deleted);
      const result = await service.remove('1');
      expect(result).toEqual(deleted);
    });
  });
});
