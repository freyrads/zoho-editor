import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User as UserModel } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers(): Promise<UserModel[]> {
    return this.appService.getUsers();
  }
}
