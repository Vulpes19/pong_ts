import { Socket, Server } from "socket.io";
import { EventEmitter2 } from "@nestjs/event-emitter";

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

export enum GAME_MODE {
    MULTIPLAYER,
    PRACTICE,
    MULTIPLAYER_POWERUPS,
    PRACTICE_POWERUPS
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
        // this.serverRef = new WeakRef(server);
        // this.server?.to(this.room).emit('startGame', true);
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

    updateBall() {
        if (this.ballPosition.y < 0 ||
            this.ballPosition.y + ballRadius > HEIGHT) {
                this.ballVelocity.y = -this.ballVelocity.y;
        }
        else if (this.ballPosition.x < 0) {
            this.acceleration = 1;
            this.ballVelocity.x = -this.ballVelocity.x;
            this.score.right += 1;
            this.ballPosition.x = resetBallPosition.x;
            this.ballPosition.y = resetBallPosition.y;
            this.server.to(this.room).emit('rightScoreUpdate', this.score.right);
        }
        else if (this.ballPosition.x + ballRadius > WIDTH) {
            this.acceleration = 1;
            this.ballVelocity.x = -this.ballVelocity.x;
            this.score.left += 1;
            this.ballPosition.x = resetBallPosition.x;
            this.ballPosition.y = resetBallPosition.y;
            this.server.to(this.room).emit('leftScoreUpdate', this.score.left);
        }
        else if ((this.ballPosition.y >= this.leftPaddlePosition &&
            this.ballPosition.y <= this.leftPaddlePosition + paddleHeight &&
            this.ballPosition.x < paddle1X + paddleWidth) || (
                this.ballPosition.y >= this.rightPaddlePosition &&
                this.ballPosition.y <= this.rightPaddlePosition + paddleHeight &&
                this.ballPosition.x + ballRadius >= paddle2X 
            )) {
            this.ballVelocity.x = -this.ballVelocity.x;
        }
        else if (this.mode === GAME_MODE.PRACTICE || this.mode === GAME_MODE.PRACTICE_POWERUPS)
        {
            this.AIpaddle();
        }
        this.ballPosition.x = this.ballPosition.x + this.ballVelocity.x;
        this.ballPosition.y = this.ballPosition.y + this.ballVelocity.y;
        this.endGame(); 
        this.server.to(this.room).emit('ballUpdate', this.ballPosition);
    };

    getRandomNumb(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return (Math.floor(Math.random() * (max - min) + min));
    }
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
    // private serverRef:WeakRef<Server>;
};