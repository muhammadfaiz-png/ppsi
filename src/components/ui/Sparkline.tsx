import React from 'react';

export interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  height = 80,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return (
      <div className={`h-[${height}px] flex items-center justify-center text-on-surface-variant text-body-sm ${className}`}>
        Data tren harga sedang dihimpun...
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 320;
  const paddingX = 16;
  const paddingY = 16;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * usableWidth;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        aria-label="Grafik tren harga 8 minggu"
      >
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d631b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d631b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill="url(#sparkline-grad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#0d631b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="3"
            fill="#0d631b"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}

        {/* Pulsing Dot on Current Value */}
        <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill="#0d631b" />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="8"
          fill="#0d631b"
          opacity="0.3"
          className="animate-ping"
        />
      </svg>
      <div className="flex items-center justify-between text-label-sm text-on-surface-variant px-1 mt-1 font-medium">
        <span>8 minggu lalu</span>
        <span>4 minggu lalu</span>
        <span className="text-primary font-bold">Hari ini</span>
      </div>
    </div>
  );
};
