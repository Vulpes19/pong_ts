import { Module } from "@nestjs/common";
import { WebSocketGatewayC } from "./WebSocket.gateway";
import { Game } from "./Game";
@Module({
    providers: [WebSocketGatewayC, Game]
})
export class WebSocketModule {}