import { Test, TestingModule } from '@nestjs/testing';
import { IotController } from '../iot.controller';

describe('IotController', () => {
  let controller: IotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IotController],
    }).compile();

    controller = module.get<IotController>(IotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
