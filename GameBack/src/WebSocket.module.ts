import { Module } from "@nestjs/common";
import { WebSocketGatewayC } from "./WebSocket.gateway";
import { GameState } from "./GameState";
import { Game } from "./Game";
@Module({
    providers: [WebSocketGatewayC, Game]
})
export class WebSocketModule {}