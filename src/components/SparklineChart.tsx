import React, { useState, useId, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface SparklinePoint {
  date: string;
  value: number;
  change?: number;
  type?: 'deposit' | 'withdraw' | 'initial';
  note?: string;
}

interface SparklineChartProps {
  points?: SparklinePoint[];
  history?: Array<{
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    note?: string;
  }>;
  currentAmount?: number;
  createdAt?: string;
  targetAmount?: number;
  color?: string; // Hex or CSS color, e.g. '#8b5cf6' or '#10b981'
  height?: number; // default 60
  currency?: string; // default '₸'
  showArea?: boolean; // default true
  showDots?: boolean; // default true
  showTrendBadge?: boolean; // default true
  showTooltip?: boolean; // default true
  showMinMaxLabels?: boolean; // default false
  showTargetLine?: boolean; // default false
  className?: string;
  label?: string;
}

/**
 * Reconstructs a chronological timeline of accumulated balances from a history ledger.
 */
export function buildAccumulatedTimeline(
  history: Array<{ date: string; amount: number; type: 'deposit' | 'withdraw'; note?: string }> = [],
  currentAmount: number = 0,
  createdAt?: string
): SparklinePoint[] {
  if (!history || history.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const startDate = createdAt ? createdAt.split('T')[0] : today;
    if (startDate === today) {
      // Return 2 points so sparkline can draw a steady line
      return [
        { date: startDate, value: currentAmount, type: 'initial', note: 'Начало' },
        { date: today, value: currentAmount, type: 'initial', note: 'Текущий баланс' },
      ];
    }
    return [
      { date: startDate, value: 0, type: 'initial', note: 'Старт' },
      { date: today, value: currentAmount, type: 'initial', note: 'Текущий баланс' },
    ];
  }

  // Sort history ascending by date
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate forward accumulation
  const result: SparklinePoint[] = [];
  
  // If creation date is earlier than first history item, add starting point
  const firstDate = sorted[0].date;
  const startDate = createdAt ? createdAt.split('T')[0] : null;
  if (startDate && startDate < firstDate) {
    result.push({
      date: startDate,
      value: 0,
      type: 'initial',
      note: 'Старт',
    });
  }

  let runningBalance = 0;
  sorted.forEach((item) => {
    const delta = item.type === 'deposit' ? item.amount : -item.amount;
    runningBalance = Math.max(0, runningBalance + delta);
    result.push({
      date: item.date,
      value: runningBalance,
      change: delta,
      type: item.type,
      note: item.note,
    });
  });

  // Ensure the latest point matches currentAmount
  const today = new Date().toISOString().split('T')[0];
  const lastPoint = result[result.length - 1];
  if (!lastPoint || lastPoint.value !== currentAmount || lastPoint.date !== today) {
    result.push({
      date: today,
      value: currentAmount,
      type: 'initial',
      note: 'Текущий остаток',
    });
  }

  // Deduplicate points with identical dates if multiple operations occurred on same day
  const mergedMap = new Map<string, SparklinePoint>();
  result.forEach((p) => {
    mergedMap.set(p.date, p);
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If only 1 point, duplicate it with a slightly offset date for visual rendering
  if (merged.length === 1) {
    const p = merged[0];
    return [
      { ...p, value: Math.round(p.value * 0.8), date: 'Старт' },
      p,
    ];
  }

  return merged;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  points: rawPoints,
  history,
  currentAmount,
  createdAt,
  targetAmount,
  color = '#10b981',
  height = 54,
  currency = '₸',
  showArea = true,
  showDots = true,
  showTrendBadge = true,
  showTooltip = true,
  showMinMaxLabels = false,
  showTargetLine = false,
  className = '',
  label,
}) => {
  const gradientId = useId().replace(/:/g, '');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute final dataset
  const points = useMemo(() => {
    if (rawPoints && rawPoints.length > 0) return rawPoints;
    return buildAccumulatedTimeline(history, currentAmount ?? 0, createdAt);
  }, [rawPoints, history, currentAmount, createdAt]);

  if (points.length < 2) {
    return null;
  }

  // Calculate domain bounds
  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values, targetAmount && showTargetLine ? targetAmount : 0);
  
  // Add 10% breathing room on top and bottom
  const diff = rawMax - rawMin || 1;
  const padding = diff * 0.12;
  const minY = Math.max(0, rawMin - padding);
  const maxY = rawMax + padding;

  const width = 300; // Normalized internal coordinate viewBox width
  const svgHeight = height;

  // Coordinate mapping helper
  const getX = (index: number) => {
    if (points.length <= 1) return width / 2;
    return (index / (points.length - 1)) * (width - 16) + 8;
  };

  const getY = (val: number) => {
    if (maxY === minY) return svgHeight / 2;
    const ratio = (val - minY) / (maxY - minY);
    // Invert SVG Y (0 at top) with 6px padding
    return svgHeight - 6 - ratio * (svgHeight - 12);
  };

  // Generate smooth cubic bezier SVG curve
  const pathD = useMemo(() => {
    const coords = points.map((p, i) => ({ x: getX(i), y: getY(p.value) }));
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 >= coords.length ? coords.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points, minY, maxY, svgHeight]);

  // Generate area fill path closed at bottom
  const areaD = useMemo(() => {
    if (!pathD) return '';
    const lastX = getX(points.length - 1);
    const firstX = getX(0);
    const bottomY = svgHeight;
    return `${pathD} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [pathD, points.length, svgHeight]);

  // Trend statistics
  const firstVal = points[0]?.value || 0;
  const lastVal = points[points.length - 1]?.value || 0;
  const delta = lastVal - firstVal;
  const pctChange = firstVal > 0 ? Math.round((delta / firstVal) * 100) : lastVal > 0 ? 100 : 0;
  const isUp = delta > 0;
  const isDown = delta < 0;

  // Active hover point
  const activeIndex = hoverIndex !== null ? hoverIndex : points.length - 1;
  const activePoint = points[activeIndex];
  const activeX = getX(activeIndex);
  const activeY = getY(activePoint?.value ?? 0);

  // Target line Y
  const targetY = targetAmount ? getY(targetAmount) : null;

  return (
    <div className={`relative flex flex-col space-y-1.5 ${className}`}>
      {/* Header Info: Label + Trend Badge */}
      {(label || showTrendBadge) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span>{label}</span>
            </span>
          )}
          {showTrendBadge && (
            <div className="flex items-center gap-1 ml-auto">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  isUp
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : isDown
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                }`}
                title={`Изменение: ${delta > 0 ? '+' : ''}${delta.toLocaleString('ru-RU')} ${currency}`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : isDown ? (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {isUp ? '+' : ''}
                  {pctChange}% ({delta >= 0 ? '+' : '−'}
                  {Math.abs(delta).toLocaleString('ru-RU')} {currency})
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div
        className="relative w-full overflow-visible touch-none cursor-crosshair group"
        style={{ height: `${height}px` }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area Fill Linear Gradient */}
            <linearGradient id={`sparkline-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="60%" stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Stroke Filter */}
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Reference Target Line */}
          {showTargetLine && targetY !== null && (
            <g>
              <line
                x1="4"
                y1={targetY}
                x2={width - 4}
                y2={targetY}
                stroke={color}
                strokeDasharray="3,3"
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              <text
                x={width - 6}
                y={targetY - 3}
                fill={color}
                fontSize="8"
                textAnchor="end"
                opacity="0.7"
                fontWeight="bold"
              >
                Цель: {targetAmount?.toLocaleString('ru-RU')}
              </text>
            </g>
          )}

          {/* Area Fill */}
          {showArea && (
            <path
              d={areaD}
              fill={`url(#sparkline-grad-${gradientId})`}
              className="transition-opacity duration-300"
            />
          )}

          {/* Sparkline Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${gradientId})`}
            className="transition-all duration-300"
          />

          {/* Points / Dots */}
          {showDots &&
            points.map((p, i) => {
              const cx = getX(i);
              const cy = getY(p.value);
              const isEnd = i === points.length - 1;
              const isHovered = hoverIndex === i;

              return (
                <g key={i}>
                  {/* Outer pulse for latest or hovered dot */}
                  {(isEnd || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4.5}
                      fill={color}
                      opacity={isHovered ? '0.4' : '0.3'}
                      className="animate-pulse"
                    />
                  )}
                  {/* Core dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 4 : isEnd ? 3 : 2}
                    fill={isHovered ? '#ffffff' : color}
                    stroke={isHovered ? color : '#0f172a'}
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}

          {/* Hover Vertical Guide Line */}
          {hoverIndex !== null && (
            <line
              x1={activeX}
              y1={4}
              x2={activeX}
              y2={svgHeight - 4}
              stroke="#ffffff"
              strokeDasharray="2,2"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
          )}

          {/* Invisible Overlay Hitboxes for Mouse Hover Tracking */}
          {points.map((p, i) => {
            const cx = getX(i);
            const hitWidth = width / points.length;
            return (
              <rect
                key={`hit-${i}`}
                x={cx - hitWidth / 2}
                y="0"
                width={hitWidth}
                height={svgHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onTouchStart={() => setHoverIndex(i)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip */}
        {showTooltip && hoverIndex !== null && activePoint && (
          <div
            className="absolute z-30 pointer-events-none -top-12 transform -translate-x-1/2 bg-slate-950/95 text-white border border-white/20 px-2.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap text-[11px] transition-all duration-150"
            style={{
              left: `${(activeX / width) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span style={{ color }}>●</span>
              <span>{activePoint.value.toLocaleString('ru-RU')} {currency}</span>
              {activePoint.change !== undefined && (
                <span
                  className={`text-[10px] ${
                    activePoint.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ({activePoint.change > 0 ? '+' : ''}
                  {activePoint.change.toLocaleString('ru-RU')})
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between gap-2 mt-0.5">
              <span>{activePoint.date}</span>
              {activePoint.note && <span className="text-slate-300 truncate max-w-[90px]">«{activePoint.note}»</span>}
            </div>
          </div>
        )}
      </div>

      {/* Min/Max Labels at Bottom */}
      {showMinMaxLabels && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium px-1">
          <span>Старт: {firstVal.toLocaleString('ru-RU')} {currency}</span>
          <span>Сейчас: {lastVal.toLocaleString('ru-RU')} {currency}</span>
        </div>
      )}
    </div>
  );
};
export default SparklineChart;
