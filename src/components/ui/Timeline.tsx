import React from 'react';

export interface TimelineStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        let iconNode = (
          <span className="w-8 h-8 rounded-full bg-surface-container-high text-outline flex items-center justify-center shrink-0 font-label-sm">
            {idx + 1}
          </span>
        );

        if (step.status === 'completed') {
          iconNode = (
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </span>
          );
        } else if (step.status === 'current') {
          iconNode = (
            <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            </span>
          );
        }

        return (
          <div key={idx} className="flex gap-space-md">
            <div className="flex flex-col items-center">
              {iconNode}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] my-1 ${
                    step.status === 'completed' ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                />
              )}
            </div>

            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`font-label-md text-label-md ${
                    step.status === 'completed' || step.status === 'current'
                      ? 'text-on-surface'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-label-sm text-on-surface-variant font-normal shrink-0">
                    {step.date}
                  </span>
                )}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
