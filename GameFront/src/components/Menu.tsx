import OnlineGame from "./OnlineGame";
import PracticeGame from "./PracticeGame";


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
    
    const handleOnlineClick = () => {
        selectGame('Online');
    };

    const handleOnlinePowerUpClick = () => {
        selectGame('OnlinePowerUp');
    };
    function Buttons() {
        return (
            <div>
                <button onClick={handleOfflineClick}>Practice</button>
                <button onClick={handleOfflinePowerUpClick}>Practice "PowerUps"</button>
                <button onClick={handleOnlineClick}>Multiplayer</button>
                <button onClick={handleOnlinePowerUpClick}>Multiplayer "PowerUps"</button>
            </div>
        );
    };
    return (
        <div>
            {game === '' && <Buttons/>}
            {game === 'Practice' && <PracticeGame powerUpGame={false}/>}
            {game === 'PracticePowerUp' && <PracticeGame powerUpGame={true}/>}
            {game === 'Online' && <OnlineGame powerUpGame={false}/>}
            {game === 'OnlinePowerUp' && <OnlineGame powerUpGame={true}/>}
        </div>
    )
};

export default Menu;