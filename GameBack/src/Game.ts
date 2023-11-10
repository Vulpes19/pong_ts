import { Socket, Server } from "socket.io";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { last } from "rxjs";

interface Vector {
	x: number,
	y: number
};

interface ScoreBoard {
	left: number,
	right: number
};

const WIDTH = 800;
const HEIGHT = 600;
const paddle1X = 0;
const paddle2X = 780;
const paddleWidth = 25;
const paddleHeight = 100;
const resetBallPosition = { x: 400, y: 300 };
const ballRadius = 25;
const FRAME_RATE = 1000 / 60;
const increasePowerUpPosition = { x: 390, y: 150 };
const decreasePowerUpPosition = { x: 390, y: 290 };
const speedPowerUpPosition = { x: 390, y: 450 };
const powerUpSize = 25;

export enum GAME_MODE {
	MULTIPLAYER,
	PRACTICE,
	MULTIPLAYER_POWERUPS,
	PRACTICE_POWERUPS
};

enum PADDLE {
	LEFT_PADDLE,
	RIGHT_PADDLE,
	NONE
};
export class Game {
	constructor(private client1: Socket, private client2: Socket | null, private server: Server, private eventEmitter: EventEmitter2, private ID: number, private mode: GAME_MODE) {
		if (ID && ID !== 0)
			this.room = "room " + ID.toString();
		else
			this.room = "room " + client1?.id;
		this.ballPosition = { x: 400, y: 300 };
		this.ballVelocity = { x: 5, y: 5 };
		this.score = { left: 0, right: 0 };
		this.leftPaddlePosition = 250;
		this.rightPaddlePosition = 250;
		this.finalPaddle = PADDLE.NONE;
		this.client1?.on('disconnect', () => {
			this.eventEmitter.emit('delete.game', this.room);
			this.clean();
			console.log('left paddle disconected');
		})
		if (this.client2 != null) {
			this.client2?.on('disconnect', () => {
				this.eventEmitter.emit('delete.game', this.room);
				this.clean();
				console.log('right paddle disconected');
			});
		}
		this.paddleMovement();
	};

	clean() {
		this.client1 = null;
		this.client2 = null;
		clearInterval(this.gameLoopInterval);
		// this.server = null;
		// this.eventEmitter = null;
	}
	paddleMovement() {
		this.client1?.on('movePlayer', (direction) => {
			if (direction == 'UP' && this.leftPaddlePosition > 0)
				this.leftPaddlePosition -= 10;
			else if (direction == 'DOWN' && this.leftPaddlePosition + paddleHeight < HEIGHT)
				this.leftPaddlePosition += 10;
			this.server.to(this.room).emit('leftPlayerUpdate', this.leftPaddlePosition);
		});
		if (this.mode === GAME_MODE.MULTIPLAYER) {
			this.client2?.on('movePlayer', (direction) => {
				if (direction == 'UP' && this.rightPaddlePosition > 0)
					this.rightPaddlePosition -= 10;
				else if (direction == 'DOWN' && this.rightPaddlePosition + paddleHeight < HEIGHT)
					this.rightPaddlePosition += 10;
				this.server.to(this.room).emit('rightPlayerUpdate', this.rightPaddlePosition);
			});
		}
	};

	gameLoop() {
		this.gameLoopInterval = setInterval(this.updateBall.bind(this), FRAME_RATE);
	};
	
	powerUpsCollision() {
		if (increasePowerUpPosition.x >= this.ballPosition.x && increasePowerUpPosition.x + powerUpSize <= this.ballPosition.x + ballRadius)
		{
			if (increasePowerUpPosition.y >= this.ballPosition.y && increasePowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isPaddleSizeBig === false)
			{
				console.log('yo biatch1');
				switch (this.finalPaddle) {
					case PADDLE.LEFT_PADDLE:
						this.server.to(this.room).emit('increaseSize', 'leftPaddle');
					case PADDLE.RIGHT_PADDLE:
						this.server.to(this.room).emit('increaseSize', 'rightPaddle');
				}
				this.isPaddleSizeBig = true;
			}    
			else if (decreasePowerUpPosition.y >= this.ballPosition.y && decreasePowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isPaddleSizeSmall === false)
			{
				console.log('yo biatch2');
				switch (this.finalPaddle) {
					case PADDLE.LEFT_PADDLE:
						this.server.to(this.room).emit('decreaseSize', 'leftPaddle');
					case PADDLE.RIGHT_PADDLE:
						this.server.to(this.room).emit('decreaseSize', 'rightPaddle');
				}
				this.isPaddleSizeSmall = true;
			}
			else if (speedPowerUpPosition.y >= this.ballPosition.y && speedPowerUpPosition.y + powerUpSize <= this.ballPosition.y + ballRadius && this.isBallSpedUp === false)
			{
				console.log('yo biatch3');
				this.server.to(this.room).emit('speed');
				this.isBallSpedUp = true;
				this.ballVelocity.x += 4;
				this.ballVelocity.y += 4;
			}
		}
	}

	updateBall() {
		if (this.ballPosition.y < 0 ||
			this.ballPosition.y + ballRadius >= HEIGHT) {
				this.ballVelocity.y = -this.ballVelocity.y;
		}
		else if (this.ballPosition.x + ballRadius < 0) {
			this.ballVelocity.x = -this.ballVelocity.x;
			this.score.right += 1;
			this.ballPosition.x = resetBallPosition.x;
			this.ballPosition.y = resetBallPosition.y;
			this.server.to(this.room).emit('rightScoreUpdate', this.score.right);
		}
		else if (this.ballPosition.x > WIDTH) {
			this.ballVelocity.x = -this.ballVelocity.x;
			this.score.left += 1;
			this.ballPosition.x = resetBallPosition.x;
			this.ballPosition.y = resetBallPosition.y;
			this.server.to(this.room).emit('leftScoreUpdate', this.score.left);
		}
		else if ((this.ballPosition.y >= this.leftPaddlePosition &&
			this.ballPosition.y <= this.leftPaddlePosition + paddleHeight &&
			this.ballPosition.x < paddle1X + paddleWidth)) {
			this.finalPaddle = PADDLE.LEFT_PADDLE;
			this.ballVelocity.x = -this.ballVelocity.x;
		}
		else if (this.ballPosition.y >= this.rightPaddlePosition && 
			this.ballPosition.y <= this.rightPaddlePosition + paddleHeight &&
			this.ballPosition.x + ballRadius >= paddle2X ) {
			this.finalPaddle = PADDLE.RIGHT_PADDLE;
			this.ballVelocity.x = -this.ballVelocity.x;
		}
		if (this.mode === GAME_MODE.PRACTICE || this.mode === GAME_MODE.PRACTICE_POWERUPS)
			this.AIpaddle();
		if (this.mode === GAME_MODE.MULTIPLAYER_POWERUPS || this.mode === GAME_MODE.PRACTICE_POWERUPS)
			this.powerUpsCollision();
		this.ballPosition.x = this.ballPosition.x + this.ballVelocity.x;
		this.ballPosition.y = this.ballPosition.y + this.ballVelocity.y;
		this.endGame(); 
		this.server.to(this.room).emit('ballUpdate', this.ballPosition);
	};
	
	AIpaddle() {
		let ballY = this.ballPosition.y;
		if (ballY > this.rightPaddlePosition && this.rightPaddlePosition + paddleHeight < HEIGHT )
			this.rightPaddlePosition += 10;
		else if (ballY < this.rightPaddlePosition && this.rightPaddlePosition > 0)
			this.rightPaddlePosition -= 10;
		this.server.to(this.room).emit('rightPlayerUpdate', this.rightPaddlePosition);
	};

	endGame() {
		if (this.score.left >= 10)
		{
			this.eventEmitter.emit('left.won', this.room);
			this.clean();
		}    
		else if (this.score.right >= 10)
		{
			this.eventEmitter.emit('right.won', this.room);
			this.clean();
		}
	};

	private room: string;
	private acceleration: number = 1;
	private leftPaddlePosition: number;
	private rightPaddlePosition: number;
	private ballPosition: Vector;
	private ballVelocity: Vector;
	private score: ScoreBoard;
	private gameLoopInterval;
	private isPaddleSizeBig: boolean = false;
	private isPaddleSizeSmall: boolean = false;
	private isBallSpedUp: boolean = false;
	private finalPaddle: PADDLE;
	// private currentTime: number;
	// private lastTime: number;
	// private serverRef:WeakRef<Server>;
};