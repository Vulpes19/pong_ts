import { useEffect } from "react";

function App() {
  let y: number = 250;
  useEffect( () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    ctx = canvas.getContext("2d");
    const paddle1 = new Image();
    const paddle2 = new Image();
    const ball = new Image();
    paddle1.src = "src/assets/paddle.png";
    paddle2.src = "src/assets/paddle.png";
    ball.src = "src/assets/ball.png";
    function draw() {
      if (canvas)
      {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        if (ctx)
          ctx.fillStyle = "black";
        //background
        ctx?.fillRect(0, 0, 800, 600);
        //paddle1
        ctx?.drawImage(paddle1, 0, y);
        //paddle2
        ctx?.drawImage(paddle1, 780, 250);
        //ball
        ctx?.drawImage(ball, 400, 300);
      }
    };
    draw();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key == 'ArrowUp')
      {
        console.log('arrow up');
        y -= 10;
      }
      if (event.key == 'ArrowDown')
      {
        console.log('arrow down');
        y += 10;
      }
      draw();
    } 
  }, [y]);

  return (
    <>
      <canvas id='canvas' width={800} height={600}></canvas>
    </>
  )
}

export default App
