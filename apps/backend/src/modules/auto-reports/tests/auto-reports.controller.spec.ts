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

  it('getSchedules() should include S001 schedule', () => {
    const schedules = controller.getSchedules();
    const s001 = schedules.find((s: any) => s.id === 'S001');
    expect(s001).toBeDefined();
    expect(s001?.name).toContain('CITES');
  });

  it('createSchedule() should generate a unique id', () => {
    const dto = { name: 'Test2', frequency: 'weekly', cronExpr: '0 8 * * 1', recipients: [], type: 'health' };
    const result = controller.createSchedule(dto);
    expect(result.id).toBeDefined();
    expect(result.id).toMatch(/^S\d+/);
  });

  it('deleteSchedule() should return deleted=true', () => {
    const result = controller.deleteSchedule('S002');
    expect(result.deleted).toBe(true);
    expect(result.id).toBe('S002');
  });

  it('runNow() should return triggered=true', () => {
    const result = controller.runNow('S001');
    expect(result.triggered).toBe(true);
    expect(result.id).toBe('S001');
    expect(result.runAt).toBeDefined();
  });
});
