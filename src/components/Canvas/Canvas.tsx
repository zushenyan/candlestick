import React, { useRef, useEffect } from 'react';

export type Props = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

const Candlestick: React.FC<Props> = ({ width, height, draw }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let animationFrameId: number;

    const render = () => {
      if (ctx) {
        draw(ctx);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [draw]);
  return <canvas width={width} height={height} ref={canvasRef} />;
};

export default Candlestick;
