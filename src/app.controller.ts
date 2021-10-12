import { Controller, Get, Param } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sendMessage')
  async sendMessage(): Promise<string> {
    return this.appService.sendMessage();
  }

  @Get('sendMessageWithOptions')
  async sendMessageWithOptions(): Promise<string> {
    return this.appService.sendMessageWithOptions();
  }

  @Get('sendError')
  async sendError(): Promise<string> {
    return this.appService.sendError();
  }

  @Get('testA/:count')
  async loadTestA(@Param('count') count: string): Promise<string> {
    await this.appService.loadTestA(Number(count));
    return 'Done';
  }

  @Get('testB/:count')
  async loadTestB(@Param('count') count: string): Promise<string> {
    await this.appService.loadTestB(Number(count));
    return 'Done';
  }
}
