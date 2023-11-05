import { Stage, Layer, Image, Text, Rect } from "react-konva";
import {Menu} from "./components/Menu"

const WIDTH: number = 800;
const HEIGHT: number = 600;


function App() {
	return (
		<Stage width={WIDTH} height={HEIGHT}>
			<Layer>
				<Rect width={WIDTH} height={HEIGHT} fill="RED"></Rect>
			</Layer>
			<div>
				<button>Offline</button>
				<button>Online</button>
			</div>
		 </Stage>
		);
	}
	
export default App;
