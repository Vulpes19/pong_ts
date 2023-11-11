import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketServer
} from '@nestjs/websockets';

import { WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game, GAME_MODE } from './Game';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway(3001,{ cors: {
	origin: "http://localhost:5173",
	transports: ['websocket']
}})

export class WebSocketGatewayC implements OnGatewayConnection, OnGatewayDisconnect {
	
	@WebSocketServer() server: Server;

	constructor(private eventEmitter: EventEmitter2) {
		this.roomsNbr = 0;
		setInterval(this.matchmaking.bind(this), 2000);
	};

	handleConnection(client: Socket) {
		console.log('client: ', client.id, ' has connected');
		// client.on('gameMode', (data) => {
		// 	console.log('yo')
		// 	if (data === 'defaultGame')
		// 		this.queueDefault.push(client);
		// 	else if (data == 'powerUpGame')
		// 		this.queuePowerUps.push(client);
		// })
	}
	
	handleDisconnect(client: Socket) {
		console.log('client: ', client.id, ' has disconnected');
		let index = this.queueDefault?.indexOf(client);
		if (index !== -1) {
			this.queueDefault.splice(index, 1);
			return ;
		}
		index = this.queuePowerUps?.indexOf(client);
		if (index !== -1) {
			this.queuePowerUps.splice(index, 1);
			return ;
		}
	}

	@SubscribeMessage('gameMode')
	getGameMode(client: Socket, gameMode: string) {
		console.log('message received')
		if (gameMode === 'defaultGame')
		this.queueDefault.push(client);
	else if (gameMode == 'powerUpGame')
	this.queuePowerUps.push(client);
}

matchmaking() {
	// console.log('Im in matchmaking', this.queueDefault?.length);
		let gameMode: GAME_MODE = GAME_MODE.MULTIPLAYER;
		let queue: Socket[] | null = null;
		if (this.queueDefault?.length >= 2)
		{
			queue = this.queueDefault;
			console.log('DEFAULT GAME MODE')
		}
		if (this.queuePowerUps?.length >= 2)
		{
			queue = this.queuePowerUps;
			gameMode = GAME_MODE.MULTIPLAYER_POWERUPS;
			console.log('POWER UP GAME MODE')
		}
		if (queue)
		{
			console.log('found a match !');
			const socket1: Socket = queue.pop();
			const socket2: Socket = queue.pop();
			console.log('setting up the game...');
			const roomNbr: number = this.roomsNbr + 1;
			socket1.join("room " + roomNbr.toString());
			socket2.join("room " + roomNbr.toString());
			this.server?.to("room " + roomNbr.toString()).emit('startGame', true);
			// client.emit('status', 'connected');
			this.startGame(socket1, socket2, roomNbr, gameMode);
		}
	};
	
	//start multiplayer game
	startGame(socket1: Socket, socket2: Socket, ID: number, gameMode: GAME_MODE) {
		const game = new Game(socket1, socket2, this.server, this.eventEmitter, ID, gameMode);
		this.games.set("room " + ID.toString(), game);
		game.gameLoop();
	};

	//start practice game
	@SubscribeMessage('startPractice')
	startPractice(socket: Socket, gameMode: string) {
		let mode: GAME_MODE = GAME_MODE.PRACTICE;
		if (gameMode === 'powerUpGame')
		{
			console.log('power uuup')
			mode = GAME_MODE.PRACTICE_POWERUPS;
		}
		const game = new Game(socket, null, this.server, this.eventEmitter, 0, mode);
		socket.join("room " + socket.id);
		this.games.set("room " + socket.id, game);
		game.gameLoop();
	}

	@OnEvent('delete.game')
	deleteGame(room: string) {
		if (this.games.delete(room))
		{
			console.log('room is deleted');
			this.server.to(room).emit('GameResult', 'Player lost connection');
			this.roomsNbr -= 1;
		}
		else
			console.log('room not found');
	};

	@OnEvent('left.won')
	leftPlayerWon(room: string) {
		console.log('left player won');
		if (this.games.delete(room))
			console.log('room is deleted');
		else
			console.log('room not found');
		this.server.to(room).emit('GameResult', 'Left Player Wins');
	};
	@OnEvent('right.won')
	rightPlayerWon(room: string) {
		console.log('right player won');
		if (this.games.delete(room))
			console.log('room is deleted');
		else
			console.log('room not found');
		this.server.to(room).emit('GameResult', 'Right Player Wins');
	};

	private queueDefault: Socket[] = [];  //queue for the default game mode
	private queuePowerUps: Socket[] = []; //queue for the power ups game mode
	private games = new Map<string, Game>(); //map of Game objects
	private roomsNbr: number; //rooms counter
};