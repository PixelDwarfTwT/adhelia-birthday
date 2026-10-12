"use client";

import { useEffect, useRef } from "react";
import { getParticleLimit } from "@/lib/particle-settings";

interface CelebrationCanvasProps {
  active: boolean;
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  phase: number;
  alpha: number;
}

export function CelebrationCanvas({ active, reducedMotion }: CelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!active || reducedMotion || canvasElement === null) return;
    const canvas = canvasElement as HTMLCanvasElement;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    const limit = getParticleLimit(window.innerWidth, reducedMotion);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    resize();
    const particles: Particle[] = Array.from({ length: limit }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.2,
      speed: .25 + Math.random() * .9,
      sway: Math.random() * .7,
      phase: Math.random() * Math.PI * 2,
      alpha: .25 + Math.random() * .7,
    }));

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.phase += .015;
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.phase) * particle.sway;
        if (particle.y < -4) {
          particle.y = height + 4;
          particle.x = Math.random() * width;
        }
        context.beginPath();
        context.fillStyle = `rgba(253, 224, 71, ${particle.alpha})`;
        context.shadowBlur = 10;
        context.shadowColor = "rgba(253, 224, 71, .6)";
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      frame = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [active, reducedMotion]);

  return <canvas aria-hidden="true" className="celebration-canvas" ref={canvasRef} />;
}
