import { Socket, Server } from "socket.io";

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

export class Game {
    constructor(private client1: Socket, private client2: Socket, private server: Server, private ID: number) {
        if (ID)
            this.room = "room " + ID.toString();
        this.ballPosition = { x: 400, y: 300 };
        this.ballVelocity = { x: 5, y: 5 };
        this.score = { left: 0, right: 0 };
        this.leftPaddlePosition = 250;
        this.rightPaddlePosition = 250;
        // this.server?.to(this.room).emit('startGame', true);
        this.client1?.on('disconnect', () => {
            console.log('left paddle disconected');
        });
        this.client2?.on('disconnect', () => {
            console.log('right paddle disconected');
        });
        this.paddleMovement();
    };

    paddleMovement() {
        this.client1?.on('movePlayer', (direction) => {
            if (direction == 'UP')
                this.leftPaddlePosition -= 10;
            else if (direction == 'DOWN')
                this.leftPaddlePosition += 10;
            this.server.to(this.room).emit('leftPlayerUpdate', this.leftPaddlePosition);
        });
        this.client2?.on('movePlayer', (direction) => {
            // console.log('received paddle movement')
            if (direction == 'UP')
                this.rightPaddlePosition -= 10;
            else if (direction == 'DOWN')
                this.rightPaddlePosition += 10;
            this.server.to(this.room).emit('rightPlayerUpdate', this.rightPaddlePosition);
        });
    };

    gameLoop() {
        setInterval(this.updateBall.bind(this), FRAME_RATE);
    };

    updateBall() {
        if (this.ballPosition.y < 0 ||
            this.ballPosition.y + ballRadius > HEIGHT) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }
        else if (this.ballPosition.x < 0) {
            this.ballVelocity.x = -this.ballVelocity.x;
            this.score.right += 1;
            this.ballPosition.x = resetBallPosition.x;
            this.ballPosition.y = resetBallPosition.y;
            this.server.to(this.room).emit('rightScoreUpdate', this.score.right);
        }
        else if (this.ballPosition.x + ballRadius > WIDTH) {
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
                this.ballPosition.x >= paddle2X
            )) {
            this.ballVelocity.x = -this.ballVelocity.x;
        }
        this.ballPosition.x = this.ballPosition.x + this.ballVelocity.x;
        this.ballPosition.y = this.ballPosition.y + this.ballVelocity.y;
        this.server.to(this.room).emit('ballUpdate', this.ballPosition);
    };

    endGame() {

    }
    private room: string;
    private leftPaddlePosition: number;
    private rightPaddlePosition: number;
    private ballPosition: Vector;
    private ballVelocity: Vector;
    private score: ScoreBoard;
};