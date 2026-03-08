import { Test, TestingModule } from '@nestjs/testing';
import { GpsController } from '../gps.controller';
import { GpsService } from '../gps.service';

describe('GpsController', () => {
  let controller: GpsController;
  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GpsController],
      providers: [{ provide: GpsService, useValue: mockService }],
    }).compile();
    controller = module.get<GpsController>(GpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
