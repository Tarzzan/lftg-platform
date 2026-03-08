import { Test, TestingModule } from '@nestjs/testing';
import { AutoReportsService } from '../auto-reports.service';

describe('AutoReportsService', () => {
  let service: AutoReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoReportsService],
    }).compile();
    service = module.get<AutoReportsService>(AutoReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
