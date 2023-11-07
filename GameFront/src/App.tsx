import Menu from "./components/Menu";
import {useState} from "react";

function App() {
	const [game, selectGame] = useState<string>('');

	return (
		<div>
			<Menu game={game} selectGame={selectGame}/>
		</div>
		);
	}
	
export default App;
