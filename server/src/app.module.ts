import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZohoController } from './zoho/zoho.controller';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'docs'),
      renderPath: 'files',
    }),
  ],
  controllers: [AppController, ZohoController],
  providers: [AppService],
})
export class AppModule {}
