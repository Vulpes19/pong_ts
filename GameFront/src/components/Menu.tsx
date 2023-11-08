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
                <button onClick={handleOnlineClick}>Multiplayer</button>
                <button onClick={handleOnlinePowerUpClick}>Multiplayer "PowerUps"</button>
            </div>
        );
    };
    return (
        <div>
            {game === '' && <Buttons/>}
            {game === 'Practice' && <PracticeGame/>}
            {game === 'Online' && <OnlineGame powerUpGame={false}/>}
            {game === 'OnlinePowerUp' && <OnlineGame powerUpGame={true}/>}
        </div>
    )
};

export default Menu;