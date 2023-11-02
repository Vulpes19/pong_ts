import { NestFactory } from '@nestjs/core';
import { WebSocketModule } from './WebSocket.module';
import {IoAdapter} from  '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(WebSocketModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(3000);
}
bootstrap();
