import MultiplayerGame from "./MultiplayerGame";
import PracticeGame from "./PracticeGame";
import {socketStore} from "../utils/Stores"


interface MenuProps {
    game: string;
    selectGame: (game: string) => void;
}

function Menu({game, selectGame}: MenuProps) {
    const handleOfflineClick = () => {
        selectGame('Practice');
    };
    
    const handleOfflinePowerUpClick = () => {
        selectGame('PracticePowerUp');
    };
    
    const handleMultiplayerClick = () => {
        selectGame('Multiplayer');
    };

    const handleMultiplayerPowerUpClick = () => {
        selectGame('MultiplayerPowerUp');
    };
    function Buttons() {
        return (
            <div>
                <button onClick={handleOfflineClick}>Practice</button>
                <button onClick={handleOfflinePowerUpClick}>Practice "PowerUps"</button>
                <button onClick={handleMultiplayerClick}>Multiplayer</button>
                <button onClick={handleMultiplayerPowerUpClick}>Multiplayer "PowerUps"</button>
            </div>
        );
    };
    return (
        <div>
            {game === '' && <Buttons/>}
            {game === 'Practice' && <PracticeGame powerUpGame={false}/>}
            {game === 'PracticePowerUp' && <PracticeGame powerUpGame={true}/>}
            {game === 'Multiplayer' && <MultiplayerGame powerUpGame={false}/>}
            {game === 'MultiplayerPowerUp' && <MultiplayerGame powerUpGame={true}/>}
        </div>
    )
};

export default Menu;