import { Test, TestingModule } from '@nestjs/testing';
import { AutoReportsService } from '../auto-reports.service';

// Mock nodemailer to avoid real SMTP connections
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('AutoReportsService', () => {
  let service: AutoReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoReportsService],
    }).compile();
    service = module.get<AutoReportsService>(AutoReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendReport() should call transporter.sendMail', async () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = nodemailer.createTransport();
    await service.sendReport();
    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });

  it('sendReport() should send to admin@lftg.fr', async () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = nodemailer.createTransport();
    await service.sendReport();
    const callArgs = mockTransporter.sendMail.mock.calls[0][0];
    expect(callArgs.to).toBe('admin@lftg.fr');
  });

  it('sendReport() should include a PDF attachment', async () => {
    const nodemailer = require('nodemailer');
    const mockTransporter = nodemailer.createTransport();
    await service.sendReport();
    const callArgs = mockTransporter.sendMail.mock.calls[0][0];
    expect(callArgs.attachments).toBeDefined();
    expect(callArgs.attachments.length).toBeGreaterThan(0);
    expect(callArgs.attachments[0].filename).toContain('.pdf');
  });

  it('handleCron() should call sendReport', async () => {
    const spy = jest.spyOn(service, 'sendReport').mockResolvedValue(undefined);
    await service.handleCron();
    expect(spy).toHaveBeenCalled();
  });
});
