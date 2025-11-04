"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

export function DotMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>();
  const themeRef = useRef<string>("light");

  useEffect(() => {
    const updateTheme = () => {
      themeRef.current = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    updateTheme();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let logicalWidth = 0;
    let logicalHeight = 0;
    let isInitialized = false;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;

      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = logicalWidth + "px";
      canvas.style.height = logicalHeight + "px";

      initDots();
      isInitialized = true;
    };

    const initDots = () => {
      const spacing = 24;
      const dots: Dot[] = [];
      const cols = Math.ceil(logicalWidth / spacing) + 2;
      const rows = Math.ceil(logicalHeight / spacing) + 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dots.push({
            x: x * spacing,
            y: y * spacing,
            baseX: x * spacing,
            baseY: y * spacing,
            vx: 0,
            vy: 0,
          });
        }
      }

      dotsRef.current = dots;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const getDotColor = () => {
      const isDark = themeRef.current === "dark";
      return isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)";
    };

    const animate = () => {
      if (!ctx || !isInitialized || dotsRef.current.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      ctx.fillStyle = getDotColor();

      const mouse = mouseRef.current;
      const repulsionRadius = 240;
      const repulsionStrength = 0.03;
      const damping = 0.9;
      const returnStrength = 0.01;

      dotsRef.current.forEach((dot) => {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repulsionRadius && distance > 0) {
          const force = (1 - distance / repulsionRadius) * repulsionStrength;
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;
        }

        const returnDx = dot.baseX - dot.x;
        const returnDy = dot.baseY - dot.y;
        const returnDistance = Math.sqrt(
          returnDx * returnDx + returnDy * returnDy
        );

        if (returnDistance > 0.1) {
          const returnForce = Math.min(returnDistance * returnStrength, 0.08);
          dot.vx += (returnDx / returnDistance) * returnForce;
          dot.vy += (returnDy / returnDistance) * returnForce;
        } else {
          dot.vx *= 0.98;
          dot.vy *= 0.98;
        }

        dot.vx *= damping;
        dot.vy *= damping;
        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-2]"
      style={{ background: "transparent" }}
    />
  );
}
