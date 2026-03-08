import { Test, TestingModule } from '@nestjs/testing';
import { MedicalController } from '../medical.controller';
import { MedicalService } from '../medical.service';

describe('MedicalController', () => {
  let controller: MedicalController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalController],
      providers: [{ provide: MedicalService, useValue: mockService }],
    }).compile();
    controller = module.get<MedicalController>(MedicalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
