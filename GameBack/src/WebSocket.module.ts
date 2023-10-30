import { Module } from "@nestjs/common";
import { WebSocketGatewayC } from "./WebSocket.gateway";
import { AppController } from "./app.controller";
import { PlayerService } from "./player.service";
import { BallService } from "./ball.service";
import { GameState } from "./GameState";

@Module({
    providers: [WebSocketGatewayC, PlayerService, BallService, GameState],
    controllers: [AppController]
})
export class WebSocketModule {}