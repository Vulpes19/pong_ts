import React from "react";
import OnlineGame from "./OnlineGame";
import {useState} from "react"

const [game, selectGame] = useState<string>('');

const handleOfflineClick = () => {
    selectGame('Offline');
}

const handleOnlineClick = () => {
    selectGame('Online');
}

function Buttons() {
    return (
        <div>
            <button onClick={handleOfflineClick}>Offline</button>
            <button onClick={handleOnlineClick}>Online</button>
        </div>
    );
}
export function Menu() {
    return (
        <div>
            <Buttons/>
            {game === 'Offline' && <OnlineGame/>};
            {game === 'Online' && <OnlineGame/>};
        </div>
    )
}