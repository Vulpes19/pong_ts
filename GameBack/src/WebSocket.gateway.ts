import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { PlayerService } from './player.service';
import { BallService } from './ball.service';
import { ScoreService } from './score.service';
import { subscribe } from 'diagnostics_channel';
import { Server, Socket } from 'socket.io';
import { Game } from './Game';

@WebSocketGateway(3001,{ cors: {
	origin: "http://localhost:5173",
	transports: ['websocket']
}})

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
	constructor() {
		this.roomsNbr = 0;
		setInterval(this.matchmaking.bind(this), 2000);
	};

	handleConnection(client: Socket) {
		console.log('client: ', client.id, ' has connected');
		this.queue.push(client);
	}
	handleDisconnect(client: Socket) {
		console.log('client: ', client.id, ' has disconnected');
		const index = this.queue?.indexOf(client);
		if (index !== -1)
			this.queue.splice(index, 1);
	}
	@WebSocketServer() server: Server;

	matchmaking() {
		// console.log('Im in matchmaking', this.queue?.length);
		if (this.queue?.length >= 2)
		{
			console.log('found a match !');
			const socket1: Socket = this.queue.pop();
			const socket2: Socket = this.queue.pop();
			const roomNbr = this.roomsNbr + 1;
			socket1.join("room " + roomNbr.toString());
			socket2.join("room " + roomNbr.toString());
			this.startGame(socket1, socket2, roomNbr);
		}
	};

	startGame(socket1: Socket, socket2: Socket, ID: number) {
		const game = new Game(socket1, socket2, this.server, ID);
		game.gameLoop();
	};


	private queue: Socket[] = [];
	private roomsNbr: number;
	// @SubscribeMessage('message')
	// sendMsg(client: any, data: string) {
	//     this.server.emit('msg', 'helooooooo');
	// }
	
	// @SubscribeMessage('movePlayer')
	// movePlayer(client: any, direction: string) {
	//     // console.log('movePlayer');
	//     const updatedPositions = this.player.movePlayer(client, direction);
	//     this.server.emit('PlayerPositionsUpdate', updatedPositions);
	//     return 'positions updated';
	// }

	// @SubscribeMessage('updateBall')
	// updateBall(client: Socket) {
	//     const updatedBall = this.ball.update();
	//     this.server.emit('BallPositionUpdate', updatedBall);
	// }
	// @SubscribeMessage('updateScore')
	// updateScore(client: any) {
	//     const updatedScore = this.score.getScore();
	//     this.server.emit('scoreUpdate', updatedScore);
	// }
};