'use client';

import React, { useEffect, useRef } from 'react';

export const AthanaCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setSize();
    window.addEventListener('resize', setSize);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 100; // Reduce particles on mobile
    const particles: Star[] = [];

    // Cores mais sutis
    const colors = ['#ffffff', '#A1E6EA', '#00F0FF'];

    class Star {
      x: number = 0;
      y: number = 0;
      speed: number;
      radius: number;
      color: string;
      alpha: number;

      constructor() {
        this.speed = 0;
        this.radius = 0;
        this.color = '';
        this.alpha = 1;
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -10;

        // Profundidade (Z)
        const z = Math.random();

        // VELOCIDADE REDUZIDA:
        // Antes era (z * 12) + 2. Agora é muito mais lento e suave.
        this.speed = (z * 0.8) + 0.2;

        this.radius = (z * 1.2) + 0.3;

        // Opacidade baseada na profundidade
        this.alpha = (z * 0.5) + 0.3;

        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speed;

        // Reiniciar suavemente ao sair da tela
        if (this.y > height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;

        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // Glow suave apenas nas partículas maiores e se não for mobile
        if (!isMobile && this.radius > 1) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = this.color;
        }

        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }
    }

    // Inicializa partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Star());
    }

    const animate = () => {
      // CORREÇÃO DO "TROVÃO":
      // Usamos clearRect para limpar totalmente o canvas.
      // Isso elimina o acúmulo de cores que causava o efeito de piscar.
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};