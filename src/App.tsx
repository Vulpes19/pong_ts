import { KeyboardEventHandler, useEffect, useRef } from "react";
import { useState } from "react";
import { Stage, Layer, Image } from "react-konva";
interface Vertices {
	x: number,
	y: number
};

interface Ball {
	position: Vertices,
	velocity: Vertices,
	img: HTMLImageElement
};

interface Paddle {
	position: Vertices,
	img: HTMLImageElement
};

enum Direction {
	UP,
	DOWN
};


function addVertices(v1: Vertices, v2: Vertices): Vertices {
	// console.log(v1.x, v2.x)
	let ret: Vertices = {
		x: v1.x + v2.x,
		y: v1.y + v2.y
	};
	return (ret);
};

function	updatePlayerPosition(pos: Vertices, direction: Direction): Vertices {
	let y: number = pos.y;
	if (direction == Direction.UP)
		y -= 10;
	else
		y += 10;
	let ret: Vertices = {
		x: pos.x,
		y: y
	}
	return (ret);
} 


function App() {
	const player: Paddle = {
		position: {x: 0, y: 250},
		img: new window.Image()
	};
	const oponent: Paddle = {
		position: {x: 780, y: 250},
		img: new window.Image()
	};
	const ball: Ball = {
		position: {x: 400, y: 300},
		velocity: {x: 0, y: 10},
		img: new window.Image()
	};
	const [position, setPositon] = useState<Vertices>({x:0, y: 250});
	// const [ballPosition, setBallPosition] = useState<Vertices>({x: 400, y:300});
	const [ballX, setBallX] = useState<number>(400);
	const [ballY, setBallY] = useState<number>(300);
	const [velX, setVelX] = useState<number>(10);
	const [velY, setVelY] = useState<number>(10);
	// const [ballVelocity, setBallVelocity] = useState<Vertices>({x: 1, y: 1});
	player.img.src = 'assets/paddle.png';
	oponent.img.src = 'assets/paddle.png';
	ball.img.src = 'assets/ball.png';
	const handleMovement = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp' && position.y > 0 )
		{
			setPositon({x: 0, y: position.y - 20})
			console.log('up');
		}
		if (e.key === 'ArrowDown' && position.y < 600)
		{
			setPositon({x: 0, y: position.y + 20})
			console.log('down');
		}
	}
	useEffect( () => {
		const updateBall = () => {
			setBallX( (x: number): number => {
				if (x < 0)
				{
					setVelX(10);
					console.log(x, velX);
				}
				if (x+ 20 > 800)
				{
					setVelX(-10);
					console.log(x, velX);
				}
				return (x + velX);
			})
			setBallY( (y: number): number => {
				if (y < 0 )
				{
					setVelY(10);
					// console.log(ballPos.x, ballVelocity);
				}
				if (y + 20 > 600)
				{
					setVelY(-10);
					// console.log(ballPos.x, ballVelocity);
				}
				return (y + velY);
			})
		}
		let id: number = requestAnimationFrame(updateBall);
		return () => cancelAnimationFrame(id);
	}, [ballX, ballY, velX, velY])
	return (
		<div onKeyDown={handleMovement} tabIndex={1}>
			<Stage width={800} height={600}>
				<Layer>
					<Image image={player.img} x={position.x} y={position.y}  />
					<Image image={oponent.img} x={oponent.position.x} y={oponent.position.y} />
					<Image image={ball.img} x={ballX} y={ballY} />
				</Layer>
			</Stage>
		</div>
		);
	}
	
export default App
