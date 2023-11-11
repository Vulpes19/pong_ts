import { useEffect, useState } from 'react';

interface prop {
    src: string,
};

function TextureComponent({ src }: prop) {
    const [isTextureLoaded, setTextureLoaded] = useState<boolean>(false);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setTextureLoaded(true);
        }
        img.src = src;
    }, [src])

    return (
        <>
            {isTextureLoaded && <img src='src'/>}
        </>
    );
}

export default TextureComponent;