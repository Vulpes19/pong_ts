import { Layer, Text } from "react-konva";

export function LoadingScreen() {
    const loadingGif: HTMLImageElement = new window.Image;
    loadingGif.src = 'assets/loading.gif';
    return (
        <Layer>
            <Text text='We are looking for your oponent !' fill="white" x={110} y={200} fontSize={40}></Text>
            <Text text="please wait..." x={310} y={300} fill="white" fontSize={40}></Text>
        </Layer>
    );
}