import React from "react";
import OnlineGame from "./OnlineGame";
import OfflineGame from "./PracticeGame";
import {useState} from "react"


interface MenuProps {
    game: string;
    selectGame: (game: string) => void;
}

function Menu({game, selectGame}: MenuProps) {
    const handleOfflineClick = () => {
        selectGame('Offline');
    };
    
    const handleOnlineClick = () => {
        selectGame('Online');
    };
    function Buttons() {
        return (
            <div>
                <button onClick={handleOfflineClick}>Offline</button>
                <button onClick={handleOnlineClick}>Online</button>
            </div>
        );
    };
    return (
        <div>
            {game === '' && <Buttons/>}
            {game === 'Offline' && <OfflineGame/>}
            {game === 'Online' && <OnlineGame/>}
        </div>
    )
};

export default Menu;