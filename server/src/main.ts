import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as zoho from './libs/zoho';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3001);

  //Initializing SDK once is enough. Calling here since code sample will be tested standalone.
  //You can place SDK initializer code in your application and call once while your application start-up.
  await zoho.initializeSdk();
}
bootstrap();
