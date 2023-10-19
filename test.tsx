import { useState } from "react"

const useFrameTime = () => {
    const[frameTime, setFrameTime] = useState();
    React.useEffect( () => {
        let frameID
        const frame = time => {
            setFrameTime(time);
            frameID = requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        return () => cancelAnimationFrame(frameID);
    }, [])
    return frameTime;
}

const component = () => {
    const frameTime = useFrameTime()
    return <time={frameTime}/>
}