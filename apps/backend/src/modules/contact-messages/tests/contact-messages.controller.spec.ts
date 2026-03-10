// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { ContactMessagesController } from '../contact-messages.controller';
import { ContactMessagesService } from '../contact-messages.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  getStats: jest.fn(),
  findOne: jest.fn(),
  updateStatus: jest.fn(),
  reply: jest.fn(),
  remove: jest.fn(),
};

describe('ContactMessagesController', () => {
  let controller: ContactMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactMessagesController],
      providers: [{ provide: ContactMessagesService, useValue: mockService }],
    }).compile();
    controller = module.get<ContactMessagesController>(ContactMessagesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact message', async () => {
      const dto = { senderName: 'Jean Dupont', senderEmail: 'jean@test.fr', subject: 'Test', message: "Bonjour' };
      const result = { id: "1', reference: 'MSG-ABC123', ...dto, status: 'UNREAD' };
      mockService.create.mockResolvedValue(result);
      expect(await controller.create(dto as any)).toEqual(result);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should handle creation error', async () => {
      mockService.create.mockRejectedValue(new Error('DB error'));
      await expect(controller.create({} as any)).rejects.toThrow('DB error');
    });
  });

  describe('findAll', () => {
    it('should return all messages without filter', async () => {
      const messages = [{ id: '1', status: 'UNREAD' }, { id: '2', status: 'REPLIED' }];
      mockService.findAll.mockResolvedValue(messages);
      expect(await controller.findAll()).toEqual(messages);
      expect(mockService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter messages by status', async () => {
      const messages = [{ id: '1', status: 'UNREAD' }];
      mockService.findAll.mockResolvedValue(messages);
      expect(await controller.findAll('UNREAD')).toEqual(messages);
      expect(mockService.findAll).toHaveBeenCalledWith('UNREAD');
    });

    it('should return empty array when no messages', async () => {
      mockService.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return contact message statistics', async () => {
      const stats = { total: 10, unread: 3, replied: 5, archived: 2 };
      mockService.getStats.mockResolvedValue(stats);
      expect(await controller.getStats()).toEqual(stats);
    });

    it('should return zero stats when no messages', async () => {
      mockService.getStats.mockResolvedValue({ total: 0, unread: 0, replied: 0, archived: 0 });
      const result = await controller.getStats();
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a single message by id', async () => {
      const message = { id: '1', subject: 'Test', replies: [] };
      mockService.findOne.mockResolvedValue(message);
      expect(await controller.findOne('1')).toEqual(message);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw when message not found', async () => {
      mockService.findOne.mockRejectedValue(new Error('Not found'));
      await expect(controller.findOne('999')).rejects.toThrow('Not found');
    });
  });

  describe('updateStatus', () => {
    it('should update message status to REPLIED', async () => {
      const updated = { id: '1', status: 'REPLIED' };
      mockService.updateStatus.mockResolvedValue(updated);
      expect(await controller.updateStatus('1', 'REPLIED')).toEqual(updated);
      expect(mockService.updateStatus).toHaveBeenCalledWith('1', 'REPLIED');
    });

    it('should update message status to ARCHIVED', async () => {
      const updated = { id: '1', status: 'ARCHIVED' };
      mockService.updateStatus.mockResolvedValue(updated);
      expect(await controller.updateStatus('1', 'ARCHIVED')).toEqual(updated);
    });
  });

  describe('reply', () => {
    it('should add a reply to a message', async () => {
      const body = { content: 'Merci pour votre message', authorId: 'admin-1' };
      const result = { id: 'reply-1', ...body, messageId: '1' };
      mockService.reply.mockResolvedValue(result);
      expect(await controller.reply('1', body as any)).toEqual(result);
      expect(mockService.reply).toHaveBeenCalledWith('1', body);
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      const deleted = { id: '1', deleted: true };
      mockService.remove.mockResolvedValue(deleted);
      expect(await controller.remove('1')).toEqual(deleted);
      expect(mockService.remove).toHaveBeenCalledWith('1');
    });
  });
});
