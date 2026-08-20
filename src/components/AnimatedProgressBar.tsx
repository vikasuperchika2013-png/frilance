import React from 'react';

interface AnimatedProgressBarProps {
  percentage: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percentage,
  color = 'bg-emerald-500',
  height = 'h-3',
  showLabel = false,
  className = '',
  id,
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div id={id} className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1 font-medium text-slate-400">
          <span>Прогресс</span>
          <span className="font-semibold text-slate-200">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: `${clamped}%` }}
        >
          {clamped > 10 && (
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
