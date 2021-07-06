import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('send1')
  async sendMessage1(): Promise<string> {
    return this.appService.sendMessage1();
  }

  @Get('send2')
  async sendMessage2(): Promise<string> {
    return this.appService.sendMessage2();
  }
}
