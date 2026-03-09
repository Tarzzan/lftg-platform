import { Test, TestingModule } from '@nestjs/testing';
import { AdvancedReportsController } from '../advanced-reports.controller';
import { AdvancedReportsService } from '../advanced-reports.service';
import { Response } from 'express';

describe('AdvancedReportsController', () => {
  let controller: AdvancedReportsController;

  const mockPdfBuffer = Buffer.from('PDF_CONTENT');
  const mockService = {
    generateCitesReport: jest.fn().mockResolvedValue(mockPdfBuffer),
    generateAnnualReport: jest.fn().mockResolvedValue(mockPdfBuffer),
  };

  const mockResponse = {
    set: jest.fn(),
    end: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvancedReportsController],
      providers: [{ provide: AdvancedReportsService, useValue: mockService }],
    }).compile();

    controller = module.get<AdvancedReportsController>(AdvancedReportsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('generateCitesReport() should call service and set PDF headers', async () => {
    await controller.generateCitesReport(mockResponse);
    expect(mockService.generateCitesReport).toHaveBeenCalled();
    expect(mockResponse.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/pdf' }),
    );
    expect(mockResponse.end).toHaveBeenCalledWith(mockPdfBuffer);
  });

  it('generateAnnualReport() should call service with year and set PDF headers', async () => {
    await controller.generateAnnualReport(2024, mockResponse);
    expect(mockService.generateAnnualReport).toHaveBeenCalledWith(2024);
    expect(mockResponse.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/pdf' }),
    );
    expect(mockResponse.end).toHaveBeenCalledWith(mockPdfBuffer);
  });

  it('generateAnnualReport() filename should include year', async () => {
    await controller.generateAnnualReport(2025, mockResponse);
    expect(mockResponse.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Disposition': 'attachment; filename=annual-report-2025.pdf',
      }),
    );
  });
});
