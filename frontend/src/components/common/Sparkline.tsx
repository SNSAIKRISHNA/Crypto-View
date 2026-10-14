import React, { useMemo } from 'react';

interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  className?: string;
  isPositive?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  width = 120,
  height = 40,
  className = '',
  isPositive,
}) => {
  const { pathD, areaD, positive } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathD: '', areaD: '', positive: true };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 3;

    const effectiveHeight = height - padding * 2;
    const effectiveWidth = width;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * effectiveWidth;
      const y = height - padding - ((val - min) / range) * effectiveHeight;
      return { x, y };
    });

    const pathString = points.reduce((acc, point, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }, '');

    const areaString = `${pathString} L ${effectiveWidth},${height} L 0,${height} Z`;

    const trend = isPositive !== undefined ? isPositive : data[data.length - 1] >= data[0];

    return {
      pathD: pathString,
      areaD: areaString,
      positive: trend,
    };
  }, [data, width, height, isPositive]);

  if (!data || data.length < 2) {
    return <div className={`h-[${height}px] w-[${width}px] flex items-center justify-center text-slate-500 text-xs`}>—</div>;
  }

  const strokeColor = positive ? '#10b981' : '#ef4444';
  const gradientId = `sparkline-gradient-${positive ? 'green' : 'red'}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
