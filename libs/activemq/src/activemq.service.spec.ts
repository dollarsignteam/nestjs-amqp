import { Test, TestingModule } from '@nestjs/testing';

import { ActiveMQService } from './activemq.service';

describe('ActiveMQService', () => {
  let activeMQService: ActiveMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActiveMQService],
    }).compile();

    activeMQService = module.get<ActiveMQService>(ActiveMQService);
  });

  it('should be defined', () => {
    expect(activeMQService).toBeDefined();
  });
});
