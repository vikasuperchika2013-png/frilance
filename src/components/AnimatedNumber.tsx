import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  currency?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  id?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  currency = '₸',
  prefix = '',
  duration = 800,
  className = '',
  id,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const targetValue = value;
    const diff = targetValue - startValue;

    if (diff === 0) return;

    let animFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic function
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * ease;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [value, duration]);

  const formatted = Math.round(displayValue)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return (
    <span id={id} className={`tabular-nums font-semibold tracking-tight ${className}`}>
      {prefix}
      {formatted} {currency}
    </span>
  );
};
