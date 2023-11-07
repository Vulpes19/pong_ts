import { useEffect } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import { playerStore, ballStore, scoreStore, socketStore } from "../utils/Stores";

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
const resetBallPositionX = 400;
const resetBallPositionY = 300
const ballRadius = 25;
const FRAME_RATE = 1000 / 60;

function PracticeGame() {
	const textures: Textures = {
		ballTexture: new window.Image,
		paddleTexture: new window.Image,
	}
	const {paddle1, paddle2, movePaddle1, movePaddle2} = playerStore();
	const {ballPosition, updateBall} = ballStore();
	const {paddle1Score, paddle2Score, updatePaddle1Score, updatePaddle2Score} = scoreStore();
	const {socket, connect, send, receive, disconnect} = socketStore();
	const [isRunning, setRunning] = useState<boolean>(false);
    const [count, setCount] = useState<number>(3);

	textures.paddleTexture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';

	useEffect( () => {
		connect();
	}, []);
	
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp')
		{
			send(socket, 'UP', 'movePlayer');
		}
		if (e.key === 'ArrowDown')
		{
			send(socket, 'DOWN', 'movePlayer');
		}
	}
	// //countdown
	useEffect( () => {
        if (isRunning === false)
        {
			if (count === 0)
            {
				setRunning(true);
                setCount(3);
				send(socket, '','startPractice');
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
        
	//gameloop
	useEffect( () => {
		// receive(socket, (start) => {
		// 	setRunning(start);
		// }, 'startGame');
		if (isRunning)
		{
			const update = () => {
				receive(socket, (data) => {
					updateBall(data.x, data.y);
				}, 'ballUpdate');
			}
			receive(socket, (data) => {
				updatePaddle2Score(data);
			}, 'rightScoreUpdate');
			//receives l
			receive(socket, (data) => {
				updatePaddle1Score(data);
			}, 'leftScoreUpdate');
			//receives left player position
			receive(socket, (data) => {
				movePaddle1(data);
			}, 'leftPlayerUpdate');
			//receives right paddle position
			receive(socket, (data) => {
				movePaddle2(data);
			}, 'rightPlayerUpdate');
			window.addEventListener('keydown', handleMovement);
			let id: number = requestAnimationFrame(update);
			return () => {
				window.removeEventListener('keydown', handleMovement);
				cancelAnimationFrame(id);
			}
		}
	}, [paddle1, paddle2, ballPosition, paddle1Score, paddle2Score,socket, isRunning])
	return (
            <>
            <Stage width={WIDTH} height={HEIGHT}>
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="BLACK"></Rect>
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
	
export default PracticeGame;