import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from '../export.controller';
import { ExportService } from '../export.service';

describe('ExportController', () => {
  let controller: ExportController;
  const mockService = {
    exportStockCsv: jest.fn(),
    exportAnimauxCsv: jest.fn(),
    exportPersonnelCsv: jest.fn(),
    exportFormationCsv: jest.fn(),
    exportAuditCsv: jest.fn(),
    exportStockReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [{ provide: ExportService, useValue: mockService }],
    }).compile();
    controller = module.get<ExportController>(ExportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
