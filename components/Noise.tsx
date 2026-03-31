"use client";

import { useRef, useEffect } from "react";

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  intensity?: number;
}

export function Noise({
  patternSize = 100,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 1,
  patternAlpha = 50,
  intensity = 1,
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const canvasCssSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animationFrameId: number;
    let isPaused = false;

    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;

    const patternCtx = patternCanvas.getContext("2d");
    if (!patternCtx) return;
    const patternData = patternCtx.createImageData(patternSize, patternSize);
    const patternPixelDataLength = patternSize * patternSize * 4;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      let newCssWidth = window.innerWidth;
      let newCssHeight = window.innerHeight;

      if (canvas.parentElement) {
        const parentRect = canvas.parentElement.getBoundingClientRect();
        newCssWidth = parentRect.width;
        newCssHeight = parentRect.height;
      }

      canvasCssSizeRef.current = { width: newCssWidth, height: newCssHeight };
      canvas.width = newCssWidth * dpr;
      canvas.height = newCssHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updatePattern = () => {
      for (let i = 0; i < patternPixelDataLength; i += 4) {
        const value = Math.random() * 255 * intensity;
        patternData.data[i] = value;
        patternData.data[i + 1] = value;
        patternData.data[i + 2] = value;
        patternData.data[i + 3] = patternAlpha;
      }
      patternCtx.putImageData(patternData, 0, 0);
    };

    const drawGrain = () => {
      const { width: cssWidth, height: cssHeight } = canvasCssSizeRef.current;
      if (cssWidth === 0 || cssHeight === 0) return;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.save();

      const safePatternScaleX = Math.max(0.001, patternScaleX);
      const safePatternScaleY = Math.max(0.001, patternScaleY);
      ctx.scale(safePatternScaleX, safePatternScaleY);

      const fillPattern = ctx.createPattern(patternCanvas, "repeat");
      if (fillPattern) {
        ctx.fillStyle = fillPattern;
        ctx.fillRect(0, 0, cssWidth / safePatternScaleX, cssHeight / safePatternScaleY);
      }

      ctx.restore();
    };

    const loop = () => {
      if (isPaused) return;
      if (canvasCssSizeRef.current.width > 0 && canvasCssSizeRef.current.height > 0) {
        if (frame % patternRefreshInterval === 0) {
          updatePattern();
          drawGrain();
        }
      }
      frame++;
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        loop();
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();

    if (patternRefreshInterval > 0) {
      loop();
    } else {
      updatePattern();
      drawGrain();
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha, intensity]);

  return <canvas className="absolute inset-0 w-full h-full pointer-events-none" ref={grainRef} />;
}
