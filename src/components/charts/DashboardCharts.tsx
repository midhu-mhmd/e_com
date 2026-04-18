import React from "react";

/**
 * DonutRing Component
 */
interface DonutRingProps {
  segments: { value: number; color: string; label: string }[];
  trackColor?: string;
  strokeWidth?: number;
}

export const DonutRing: React.FC<DonutRingProps> = ({
  segments,
  trackColor = "#F1F5F9",
  strokeWidth = 11,
}) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let cumulative = 0;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="50" cy="50" r="40" fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {segments
        .filter((s) => s.value > 0)
        .map((seg, i) => {
          const C_new = 2 * Math.PI * 40;
          const arc = (seg.value / total) * C_new;
          const offset = C_new - cumulative;
          cumulative += arc;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc} ${C_new - arc}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          );
        })}
    </svg>
  );
};

/**
 * GaugeMeter Component
 */
interface GaugeMeterProps {
  segments: { value: number; color: string }[];
  strokeWidth?: number;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({ segments, strokeWidth = 10 }) => {
  const r = 35;
  const PI = Math.PI;
  const L = PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let cumulative = 0;

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 60">
      <path
        d="M 15 50 A 35 35 0 0 1 85 50"
        fill="none"
        stroke="#F8FAFC"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {segments
        .filter((s) => s.value > 0)
        .map((seg, i) => {
          const arc = (seg.value / total) * L;
          const offset = -cumulative;
          cumulative += arc;
          return (
            <path
              key={i}
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arc} ${L}`}
              strokeDashoffset={offset}
              style={{
                transition:
                  "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          );
        })}
    </svg>
  );
};

/**
 * Sparkline Component
 */
interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 30 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d - min) / range) * (height - 4) - 2,
  }));

  const d = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
