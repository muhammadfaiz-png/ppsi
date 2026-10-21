import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'button';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  let shapeClass = 'rounded-md h-4 w-full';

  if (variant === 'circle') shapeClass = 'rounded-full w-10 h-10';
  if (variant === 'button') shapeClass = 'rounded-xl h-[52px] w-full';
  if (variant === 'card') shapeClass = 'rounded-xl h-36 w-full';

  return (
    <div
      style={{ width, height }}
      className={`animate-pulse bg-surface-container-high ${shapeClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md animate-pulse">
      <div className="flex gap-space-md">
        <div className="w-24 h-24 rounded-lg bg-surface-container-high shrink-0" />
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded-full bg-surface-container-high" />
            <div className="h-5 w-3/4 rounded-md bg-surface-container-high" />
            <div className="h-4 w-1/2 rounded-md bg-surface-container-high" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="h-6 w-24 rounded-md bg-surface-container-high" />
            <div className="h-5 w-16 rounded-md bg-surface-container-high" />
          </div>
        </div>
      </div>
      <div className="h-[52px] rounded-xl bg-surface-container-high w-full" />
    </div>
  );
};
