import { Stage, Layer, Image, Text, Rect } from "react-konva";
import Menu from "./components/Menu";
import {useState} from "react";

const WIDTH: number = 800;
const HEIGHT: number = 600;


function App() {
	const [game, selectGame] = useState<string>('');

	return (
		// <Stage width={WIDTH} height={HEIGHT}>
		// 	<Layer>
		// 		<Rect width={WIDTH} height={HEIGHT} fill="RED"></Rect>
		// 	</Layer>
			<div>
				<Menu game={game} selectGame={selectGame}/>
			</div>
		//  </Stage>
		);
	}
	
export default App;
