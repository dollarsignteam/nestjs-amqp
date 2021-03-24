import { Test, TestingModule } from '@nestjs/testing';
import { ActiveMQService } from './activemq.service';

describe('ActiveMQService', () => {
  let service: ActiveMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActiveMQService],
    }).compile();

    service = module.get<ActiveMQService>(ActiveMQService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
