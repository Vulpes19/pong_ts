import { useEffect } from "react";
import { useState } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import { playerStore, ballStore, scoreStore, socketStore, powerUpsStore } from "../utils/Stores";

interface PowerUpsTextures {
	increaseSizePower: HTMLImageElement,
	decreaseSizePower: HTMLImageElement,
	speedPower: HTMLImageElement
};

const WIDTH = 800;
const HEIGHT = 600;
let gameMode: string = 'defaultGame';

interface Textures {
	ballTexture: HTMLImageElement,
	paddle1Texture: HTMLImageElement,
	paddle2Texture: HTMLImageElement
};
interface prop {
	powerUpGame: boolean
};

function PracticeGame({powerUpGame}: prop) {
	const textures: Textures = {
		ballTexture: new window.Image,
		paddle1Texture: new window.Image,
		paddle2Texture: new window.Image
	};
	let powerUpsTextures: PowerUpsTextures | undefined;
	const {paddle1, paddle2, movePaddle1, movePaddle2} = playerStore();
	const {ballPosition, updateBall} = ballStore();
	const {paddle1Score, paddle2Score, updatePaddle1Score, updatePaddle2Score} = scoreStore();
	const {socket, connect, send, receive, disconnect} = socketStore();
	const {increaseSize, decreaseSize, speed, setIncreaseSize, setDecreaseSize, setSpeed} = powerUpsStore();

	const [isRunning, setRunning] = useState<boolean>(false);
    const [count, setCount] = useState<number>(3);

	textures.paddle1Texture.src = 'assets/paddle.png';
	textures.paddle2Texture.src = 'assets/paddle.png';
	textures.ballTexture.src = 'assets/ball.png';

	function loadPowerUpTextures() {
		powerUpsTextures = {
			increaseSizePower: new window.Image,
			decreaseSizePower: new window.Image,
			speedPower: new window.Image	
		};
		powerUpsTextures.increaseSizePower.src = 'assets/Increase_size_power_up.png';
		powerUpsTextures.decreaseSizePower.src = 'assets/decrease_size_power_up.png';
		powerUpsTextures.speedPower.src = 'assets/speed_power_up.png';
	};
	if (powerUpGame)
	{
		loadPowerUpTextures();
		gameMode = 'powerUpGame';
	}

	useEffect( () => {
		connect();
	}, []);
	
	const handleMovement = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp')
			send(socket, 'UP', 'movePlayer');
		if (e.key === 'ArrowDown')
			send(socket, 'DOWN', 'movePlayer');
	}
	// //countdown
	useEffect( () => {
        if (isRunning === false)
        {
			if (count === 0)
            {
				setRunning(true);
                setCount(3);
				send(socket, gameMode, 'startPractice');
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
			receive(socket, (data) => {
				if (data == 'leftPaddle')
					textures.paddle1Texture.src = 'assets/big_paddle.png';
				else
					textures.paddle2Texture.src = 'assets/big_paddle.png';
				setIncreaseSize(false);
				console.log('increase size received');
			}, 'increaseSize');
			receive(socket, (data) => {
				if (data == 'leftPaddle')
					textures.paddle1Texture.src = 'assets/small_paddle.png';
				else
					textures.paddle2Texture.src = 'assets/big_paddle.png';
				setDecreaseSize(false);
				console.log('decrease size received');
			}, 'decreaseSize');
			receive(socket, () => {
				setSpeed(false);
				console.log('speed up received');
			}, 'speed');
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
                    <Image image={textures.paddle1Texture} x={paddle1.x} y={paddle1.y} />
                    <Image image={textures.paddle2Texture} x={paddle2.x} y={paddle2.y} />
                    <Image image={textures.ballTexture} x={ballPosition.x} y={ballPosition.y} />
					{powerUpGame === true && powerUpsTextures &&
					<> 
						{increaseSize && <Image image={powerUpsTextures.increaseSizePower} x={390} y={150} />}
						{decreaseSize && <Image image={powerUpsTextures.decreaseSizePower} x={390} y={290} />}
						{speed && <Image image={powerUpsTextures.speedPower} x={390} y={450} />}
					</>}
                </Layer>) : (
                <Layer>
                    <Text text='Get ready ! ' fill="white" x={310} y={200} fontSize={40}></Text>
                    <Text text={count.toString()} fill="white" x={400} y={250} fontSize={40}></Text>
                    <Image image={textures.paddle1Texture} x={0} y={250} />
                    <Image image={textures.paddle2Texture} x={780} y={250} />
                    <Image image={textures.ballTexture} x={400} y={300} />
                </Layer>
                )
			}
		 </Stage>
            </> 
		);
	}
	
export default PracticeGame;
