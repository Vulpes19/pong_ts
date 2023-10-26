import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketGatewayC } from './WebSocket.gateway';

@Controller()
export class AppController {
  constructor(private readonly webSocketGateway: WebSocketGatewayC) {}

  @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  sendMessage(): string {
    this.webSocketGateway.server.emit('message', 'WASSUUUUUUUUP');
    return 'Message sent';
  }
}
