import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZohoController } from './zoho/zoho.controller';

@Module({
  imports: [],
  controllers: [AppController, ZohoController],
  providers: [AppService],
})
export class AppModule {}
