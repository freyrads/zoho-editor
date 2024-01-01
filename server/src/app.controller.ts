import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  User as UserModel,
  Document as DocumentModel,
  ZohoSession as ZohoSessionModel,
} from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers(): Promise<UserModel[]> {
    return this.appService.getUsers();
  }

  @Get('documents')
  getDocuments(): Promise<DocumentModel[]> {
    return this.appService.getDocuments();
  }

  @Get('sessions')
  getSessions(): Promise<ZohoSessionModel[]> {
    return this.appService.getZohoSessions();
  }
}
