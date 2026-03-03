import { Test, TestingModule } from '@nestjs/testing';
import { Public-api-v2Service } from '../public-api-v2.service';

describe('Public-api-v2Service', () => {
  let service: Public-api-v2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Public-api-v2Service],
    }).compile();

    service = module.get<Public-api-v2Service>(Public-api-v2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
