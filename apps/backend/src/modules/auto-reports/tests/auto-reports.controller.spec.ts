import { Test, TestingModule } from '@nestjs/testing';
import { AutoReportsController } from '../auto-reports.controller';

describe('AutoReportsController', () => {
  let controller: AutoReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutoReportsController],
    }).compile();
    controller = module.get<AutoReportsController>(AutoReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSchedules() should return an array', () => {
    const result = controller.getSchedules();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getSchedule() should return a schedule by id', () => {
    const result = controller.getSchedule('S001');
    expect(result).toBeDefined();
    expect(result?.id).toBe('S001');
  });

  it('getSchedule() should return null for unknown id', () => {
    const result = controller.getSchedule('UNKNOWN');
    expect(result).toBeNull();
  });

  it('createSchedule() should return a new schedule', () => {
    const dto = {
      name: 'Test',
      frequency: 'monthly',
      cronExpr: '0 0 1 * *',
      recipients: ['test@lftg.fr'],
      type: 'cites',
    };
    const result = controller.createSchedule(dto);
    expect(result).toBeDefined();
    expect(result.status).toBe('active');
  });

  it('runNow() should return triggered=true', () => {
    const result = controller.runNow('S001');
    expect(result.triggered).toBe(true);
    expect(result.id).toBe('S001');
  });
});
