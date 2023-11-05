import { useEffect } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import { playerStore, ballStore, scoreStore } from "../utils/Stores";

interface Textures {
	ballTexture: HTMLImageElement,
	paddleTexture: HTMLImageElement 
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

function OnlineGame() {
	const textures: Textures = {
		ballTexture: new window.Image,
		paddleTexture: new window.Image,
	}
	const {paddle1, paddle2, movePaddle1, movePaddle2} = playerStore();
	const {ballPosition, velocity, updateBall, setVelX, setVelY} = ballStore();
	const {paddle1Score, paddle2Score, updatePaddle1Score, updatePaddle2Score} = scoreStore();
	const [isRunning, setRunning] = useState<boolean>(false);
    const [count, setCount] = useState<number>(3);

	textures.paddleTexture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';
	
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp')
		{
            movePaddle1(paddle1.y - 10);
		}
		if (e.key === 'ArrowDown')
		{
            movePaddle1(paddle1.y + 10);
		}
	}
	//countdown
	useEffect( () => {
        if (isRunning === false)
        {
                if (count === 0)
                {
                        setRunning(true);
                        setCount(3);
            return ;
        }
        const id = setInterval( () => {
                setCount(count - 1);
            }, 1000);
        return () => {
                clearInterval(id);
            }
        }
	}, [isRunning, count])
			
			// //gameloop
	useEffect( () => {
		if (isRunning)
		{
			const update = () => {
                if (ballPosition.y < 0 ||
                    ballPosition.y + ballRadius > HEIGHT) {
                        setVelY(-velocity.y);
                }
                else if (ballPosition.x < 0) {
                    setVelX(-velocity.x);
                    updatePaddle2Score(paddle2Score + 1);
                    updateBall(resetBallPosition.x, resetBallPosition.y);
                }
                else if (ballPosition.x + ballRadius > WIDTH) {
                    setVelX(-velocity.x);
                    updatePaddle1Score(paddle1Score + 1);
                    updateBall(resetBallPosition.x, resetBallPosition.y);
                }
                else if ((ballPosition.y >= paddle1.y &&
                    ballPosition.y <= paddle1.y + paddleHeight &&
                    ballPosition.x < paddle1X + paddleWidth) || (
                        ballPosition.y >= paddle2.y &&
                        ballPosition.y <= paddle2.y + paddleHeight &&
                        ballPosition.x + ballRadius >= paddle2X 
                    )) {
                    setVelX(-velocity.x);
                }
                updateBall(ballPosition.x + velocity.x, ballPosition.y + velocity.y);
			}
			window.addEventListener('keydown', handleMovement);
			let id: number = requestAnimationFrame(update);
			return () => {
				window.removeEventListener('keydown', handleMovement);
				cancelAnimationFrame(id);
			}
		}
	}, [paddle1, paddle2, ballPosition, paddle1Score, paddle2Score, isRunning])
	return (
            <>
            <Stage width={WIDTH} height={HEIGHT}>
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="RED"></Rect>
			</Layer>
			{isRunning ? (
                <Layer>
                    <Text text={paddle1Score.toString() + ' : ' + paddle2Score.toString()} x={360} y={20} fill="white" fontSize={50}></Text>
                    <Image image={textures.paddleTexture} x={paddle1.x} y={paddle1.y} />
                    <Image image={textures.paddleTexture} x={paddle2.x} y={paddle2.y} />
                    <Image image={textures.ballTexture} x={ballPosition.x} y={ballPosition.y} />
                </Layer>) : (
                <Layer>
                    <Text text='Get ready ! ' fill="white" x={310} y={200} fontSize={40}></Text>
                    <Text text={count.toString()} fill="white" x={400} y={250} fontSize={40}></Text>
                    <Image image={textures.paddleTexture} x={0} y={250} />
                    <Image image={textures.paddleTexture} x={780} y={250} />
                    <Image image={textures.ballTexture} x={400} y={300} />
                </Layer>
                )
			}
		 </Stage>
            </> 
		);
	}
	
export default OnlineGame;
