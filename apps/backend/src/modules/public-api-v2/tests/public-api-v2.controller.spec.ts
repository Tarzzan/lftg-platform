import { Test, TestingModule } from '@nestjs/testing';
import { Public-api-v2Controller } from '../public-api-v2.controller';

describe('Public-api-v2Controller', () => {
  let controller: Public-api-v2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Public-api-v2Controller],
    }).compile();

    controller = module.get<Public-api-v2Controller>(Public-api-v2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
