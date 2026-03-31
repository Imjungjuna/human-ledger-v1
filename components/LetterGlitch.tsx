"use client";

import { useRef, useEffect } from "react";

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
}

export function LetterGlitch({
  glitchColors = ["#ff0000", "#8b0000", "#dc143c"],
  glitchSpeed = 50,
}: LetterGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const lettersAndSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-=_+[]{}<>,0123456789".split("");

  const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

  const calculateGrid = (width: number, height: number) => ({
    columns: Math.ceil(width / charWidth),
    rows: Math.ceil(height / charHeight),
  });

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  };

  const drawLetters = () => {
    const canvas = canvasRef.current;
    const ctx = context.current;
    if (!canvas || !ctx || letters.current.length === 0) return;

    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    for (let i = 0; i < letters.current.length; i++) {
      const letterData = letters.current[i];
      const x = (i % grid.current.columns) * charWidth;
      const y = Math.floor(i / grid.current.columns) * charHeight;
      ctx.fillStyle = letterData.color;
      ctx.fillText(letterData.char, x, y);
    }
  };

  const resizeCanvasAndDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");

    const updateLettersLocal = () => {
      if (!letters.current || letters.current.length === 0) return;
      const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.current.length);
        if (!letters.current[index]) continue;
        letters.current[index].char = getRandomChar();
        letters.current[index].targetColor = getRandomColor();
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      }
    };

    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime.current >= glitchSpeed) {
        updateLettersLocal();
        drawLetters();
        lastGlitchTime.current = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvasAndDraw();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        resizeCanvasAndDraw();
        animationRef.current = requestAnimationFrame(animate);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(resizeTimeout);
    };
  }, [glitchSpeed]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
