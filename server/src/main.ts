import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as zoho from './libs/zoho';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT;

  await app.listen(port?.length ? parseInt(port) : 3001);

  const srgp = process.env.SERVER_ROUTE_GLOBAL_PREFIX;

  if (srgp?.length) {
    console.log('Route global prefix:', srgp);
    app.setGlobalPrefix(srgp);
  }

  //Initializing SDK once is enough. Calling here since code sample will be tested standalone.
  //You can place SDK initializer code in your application and call once while your application start-up.
  await zoho.initializeSdk();
}
bootstrap();
