import React, { useCallback } from 'react';
import { maxBy, minBy } from 'lodash';
import * as d3 from 'd3-scale';

import Canvas from '../Canvas';

interface Bucket {
  time: number;
  openingPrice: number;
  highestPrice: number;
  lowestPrice: number;
  closingPrice: number;
}

export type Props = {
  width: number;
  height: number;
  margin?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  buckets: Bucket[];
};

const Candlestick: React.FC<Props> = ({
  width,
  height,
  margin: { left, right, top, bottom } = {
    left: 30,
    right: 50,
    top: 30,
    bottom: 30,
  },
  buckets,
}: Props) => {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const maxPrice =
        maxBy(buckets, (d: Bucket) => d.highestPrice)?.highestPrice || 0;
      const minPrice =
        minBy(buckets, (d: Bucket) => d.lowestPrice)?.lowestPrice || 0;

      const xMin = left;
      const yMin = top;

      const xMax = width - right;
      const yMax = height - bottom;

      const xScale = d3
        .scaleBand()
        .domain(buckets.map((b) => b.time.toString()))
        .range([xMin, xMax])
        .padding(0.3);

      const yScale = d3
        .scaleLinear()
        .domain([minPrice, maxPrice])
        .range([yMax, yMin]);

      const ticks = yScale.ticks(5);

      // background
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // draw y (price) axis
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo(xMax, yMin);
      ctx.lineTo(xMax, yMax);
      ctx.stroke();

      // draw y ticks
      ticks.forEach((t) => {
        const y = yScale(t);

        ctx.strokeStyle = 'gray';
        ctx.fillStyle = 'gray';

        ctx.beginPath();
        ctx.moveTo(xMax, y);
        ctx.lineTo(xMax + 10, y);
        ctx.stroke();

        ctx.fillText(t.toString(), xMax + 12, y + 3);
      });

      // draw candlesticks
      buckets.forEach((b) => {
        const timeX = xScale(b.time.toString()) || 0;
        const lineX = timeX + xScale.bandwidth() / 2;
        const highestPriceY = yScale(b.highestPrice);
        const openingPriceY = yScale(b.openingPrice);
        const closingPriceY = yScale(b.closingPrice);
        const lowestPriceY = yScale(b.lowestPrice);
        const isRed = b.closingPrice > b.openingPrice;
        const color = isRed ? 'red' : 'green';

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // line
        ctx.beginPath();
        ctx.moveTo(lineX, highestPriceY);
        ctx.lineTo(lineX, lowestPriceY);
        ctx.stroke();

        // bar
        ctx.fillRect(
          timeX,
          isRed ? closingPriceY : openingPriceY,
          xScale.bandwidth(),
          isRed ? openingPriceY - closingPriceY : closingPriceY - openingPriceY
        );
      });
    },
    [width, height, left, right, top, bottom, buckets]
  );
  return <Canvas width={width} height={height} draw={draw} />;
};

export default Candlestick;
