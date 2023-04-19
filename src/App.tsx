import React, { useEffect, useRef } from 'react';
import './App.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

function App() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas:any = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const width = canvas.width;
    const height = canvas.height;

    const particles: Particle[] = [];
    const numParticles = 120;
    const colors = ['red', '#2E86C1', 'green', 'yellow', '#8E44AD', '#B2BABB'];

    for (let i = 0; i < numParticles; i++) {
      let color = colors[Math.floor(Math.random() * colors.length)];
      if (Math.random() < 0.4) {
        color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        size: Math.random() * (16 - 8) + 8,
        color: color,
      });
    }

    const update = () => {
      ctx.clearRect(0, 0, width, height);
    
      particles.forEach(particle => {
    
        let flockmates = particles.filter(otherParticle => 
          otherParticle !== particle && otherParticle.color === particle.color
        );
        let isFlocking = flockmates.length > 0;
    
        let avoid = { x: 0, y: 0 };
        let avoidDistance = particle.size * 5;
        particles.forEach(otherParticle => {
          if (otherParticle !== particle) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < avoidDistance) {
              avoid.x += dx / distance;
              avoid.y += dy / distance;
            }
          }
        });
    
        if (isFlocking) {
          let flockmatesCenter = { x: 0, y: 0 };
          let flockmatesVelocity = { x: 0, y: 0 };
    
          flockmates.forEach(flockmate => {
            flockmatesCenter.x += flockmate.x;
            flockmatesCenter.y += flockmate.y;
            flockmatesVelocity.x += flockmate.vx;
            flockmatesVelocity.y += flockmate.vy;
          });
    
          flockmatesCenter.x /= flockmates.length;
          flockmatesCenter.y /= flockmates.length;
    
          flockmatesVelocity.x /= flockmates.length;
          flockmatesVelocity.y /= flockmates.length;
    
          const separation = { x: 0, y: 0 };
          flockmates.forEach(flockmate => {
            const dx = particle.x - flockmate.x;
            const dy = particle.y - flockmate.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < particle.size + flockmate.size) {
              separation.x += dx / distance;
              separation.y += dy / distance;
            }
          });
    
          const cohesion = {
            x: flockmatesCenter.x - particle.x,
            y: flockmatesCenter.y - particle.y,
          };
    
          const alignment = {
            x: flockmatesVelocity.x - particle.vx,
            y: flockmatesVelocity.y - particle.vy,
          };
    
          particle.vx += separation.x * 0.5 + cohesion.x * 0.03 + alignment.x * 0.05 + avoid.x * 0.4 + (Math.random() - 0.5) * 0.34;
          particle.vy += separation.y * 0.5 + cohesion.y * 0.09 + alignment.y * 0.05 + avoid.y * 0.4 + (Math.random() - 0.5) * 0.34;
        } else {
          const wandering = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    
          particle.vx += wandering.x * 0.2 + avoid.x * 0.4 + (Math.random() - 0.5) * 0.34;
          particle.vy += wandering.y * 0.2 + avoid.y * 0.4 + (Math.random() - 0.5) * 0.34;
        }
    
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 2) {
          particle.vx *= 2 / speed;
          particle.vy *= 2 / speed;
        }
    
        particle.x += particle.vx;
        particle.y += particle.vy;
    
        if (particle.x < -particle.size) {
          particle.x = width + particle.size;
        } else if (particle.x > width + particle.size) {
          particle.x = -particle.size;
        }
        if (particle.y < -particle.size) {
          particle.y = height + particle.size;
        } else if (particle.y > height + particle.size) {
          particle.y = -particle.size;
        }
    
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(Math.atan2(particle.vy, particle.vx) + Math.PI/2);
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.restore(); 
      });

      requestAnimationFrame(update);
    };

    update();
  }, []);



  return (
    <div className="App" >
      <p><span>Dino R. Gomez</span>, <a href="https://github.com/dinogomez">@dinogomez</a></p>
      <canvas className="canvas-class" ref={canvasRef} width="700" height="700" style={{border: '1px solid white' }}></canvas>
    </div>
  );
}

export default App;
