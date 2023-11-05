import { Module } from "@nestjs/common";
import { WebSocketGatewayC } from "./WebSocket.gateway";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { Game } from "./Game";
@Module({
    imports: [EventEmitterModule.forRoot()],
    providers: [WebSocketGatewayC, Game]
})
export class WebSocketModule {}