import { useEffect } from "react";
import { BRAND_COLORS } from "../constants/theme";

export type CreatureType = 'fish' | 'shark';

export interface CreatureState {
  type: CreatureType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  phase: number;
  depth: number;
}

const CREATURE_TEMPLATES: Omit<CreatureState, 'x' | 'y' | 'phase'>[] = [
  { type: 'fish', vx: 1.1, vy: 0.18, color: BRAND_COLORS.RED, size: 13, depth: 0.95 },
  { type: 'shark', vx: 1.8, vy: 0.05, color: BRAND_COLORS.CYAN, size: 24, depth: 0.85 },
  { type: 'fish', vx: -0.85, vy: 0.22, color: BRAND_COLORS.CYAN, size: 11, depth: 0.80 },
  { type: 'fish', vx: -1.05, vy: -0.15, color: BRAND_COLORS.GOLD, size: 10, depth: 0.85 },
];

export function useSeaCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    function handleResize() {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    let t = 0;
    let lastTime: number | null = null;
    let animId: number;

    const creatures: CreatureState[] = [];
    const numItems = Math.max(8, Math.floor(W / 100));
    for (let i = 0; i < numItems; i++) {
      const template = CREATURE_TEMPLATES[i % CREATURE_TEMPLATES.length];
      creatures.push({
        ...template,
        x: Math.random() * W,
        y: (H / 2 - 80 + Math.random() * 160),
        phase: Math.random() * Math.PI * 2,
      });
    }

    function drawFish(f: CreatureState) {
      const wobble = Math.sin(t * 5 + f.phase) * 0.20;
      const tailWag = Math.sin(t * 10 + f.phase) * 0.40;
      const s = f.size;
      const angle = Math.atan2(f.vy, f.vx);
      ctx!.save();
      ctx!.translate(f.x, f.y);
      ctx!.rotate(angle + wobble);
      if (f.vx < 0) ctx!.scale(1, -1);
      ctx!.globalAlpha = f.depth;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
      ctx!.fillStyle = f.color;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-s * 0.8, 0);
      ctx!.lineTo(-s * 1.8, -s * 0.55 + tailWag * s * 0.3);
      ctx!.lineTo(-s * 1.45, tailWag * s * 0.08);
      ctx!.lineTo(-s * 1.8, s * 0.55 + tailWag * s * 0.3);
      ctx!.closePath();
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(s * 0.25, -s * 0.15, s * 0.15, 0, Math.PI * 2);
      ctx!.fillStyle = "white";
      ctx!.fill();
      ctx!.restore();
    }

    function drawShark(f: CreatureState) {
      const s = f.size;
      const tailWag = Math.sin(t * 6 + f.phase) * 0.3;
      ctx!.save();
      ctx!.translate(f.x, f.y);
      if (f.vx < 0) ctx!.scale(-1, 1);
      ctx!.globalAlpha = f.depth;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, s, s * 0.35, 0, 0, Math.PI * 2);
      ctx!.fillStyle = f.color;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-s * 0.2, -s * 0.3);
      ctx!.lineTo(-s * 0.6, -s * 0.8);
      ctx!.lineTo(-s * 0.9, -s * 0.3);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-s * 0.9, 0);
      ctx!.lineTo(-s * 1.6, -s * 0.7 + tailWag * s * 0.2);
      ctx!.lineTo(-s * 1.3, 0);
      ctx!.lineTo(-s * 1.6, s * 0.7 + tailWag * s * 0.2);
      ctx!.closePath();
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(s * 0.5, -s * 0.1, s * 0.1, 0, Math.PI * 2);
      ctx!.fillStyle = "white";
      ctx!.fill();
      ctx!.restore();
    }

    function moveCreature(f: CreatureState, dtMult: number) {
      f.x += f.vx * dtMult;
      f.y += f.vy * dtMult + Math.sin(t * 1.8 + f.phase) * 0.25 * dtMult;
      if (f.y < H / 2 - 110) f.vy = Math.abs(f.vy);
      if (f.y > H / 2 + 100) f.vy = -Math.abs(f.vy);
      if (f.vx > 0 && f.x > W + 50) f.x = -50;
      if (f.vx < 0 && f.x < -50) f.x = W + 50;
    }

    function drawSea() {
      const centerY = H / 2;
      const layers = [
        { yBase: centerY + 18, amp: 26, speed: 0.55, color: "#0e7490", alpha: 0.055 },
        { yBase: centerY + 33, amp: 16, speed: 0.90, color: "#0891b2", alpha: 0.080 },
        { yBase: centerY + 47, amp: 9, speed: 1.40, color: "#06b6d4", alpha: 0.110 },
        { yBase: centerY + 60, amp: 5, speed: 1.90, color: "#67e8f9", alpha: 0.090 },
      ];
      layers.forEach(({ yBase, amp, speed, color, alpha }) => {
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W; x += Math.max(2, Math.floor(W / 200))) {
          const y = yBase + Math.sin(x / 55 - t * speed) * amp + Math.sin(x / 24 - t * (speed * 1.35) + 1) * (amp * 0.38);
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.lineTo(0, H);
        ctx!.closePath();
        ctx!.fillStyle = color;
        ctx!.globalAlpha = alpha;
        ctx!.fill();
      });
    }

    function frame(now: number) {
      if (!ctx) return;
      if (lastTime === null) { lastTime = now; animId = requestAnimationFrame(frame); return; }
      const dtSeconds = (now - lastTime) / 1000;
      lastTime = now;
      if (dtSeconds > 0.1) { animId = requestAnimationFrame(frame); return; }
      t += dtSeconds * 1.08;
      const dtMult = dtSeconds * 60;
      ctx.clearRect(0, 0, W, H);
      drawSea();
      creatures.forEach((f) => {
        if (f.type === 'fish') drawFish(f);
        else if (f.type === 'shark') drawShark(f);
        moveCreature(f, dtMult);
      });
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, [canvasRef]);
}
