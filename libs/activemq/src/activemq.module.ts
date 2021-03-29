import { DynamicModule, Module } from '@nestjs/common';
import { ActiveMQService } from './activemq.service';

@Module({
  providers: [ActiveMQService],
  exports: [ActiveMQService],
})
export class ActiveMQModule {
  public static forRoot(): DynamicModule {
    return null;
  }

  public static forRootAsync(): DynamicModule {
    return null;
  }
}
