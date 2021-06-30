import { Test, TestingModule } from '@nestjs/testing';

import { AMQPService } from '../amqp.service';

describe('AMQPService', () => {
  let service: AMQPService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AMQPService],
    }).compile();

    service = module.get<AMQPService>(AMQPService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
