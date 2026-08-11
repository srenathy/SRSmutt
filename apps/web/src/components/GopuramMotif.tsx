import React from 'react';

interface GopuramDividerProps {
  className?: string;
  variant?: 'gold' | 'maroon' | 'ivory';
}

export const GopuramDivider: React.FC<GopuramDividerProps> = ({
  className = '',
  variant = 'gold'
}) => {
  const fillColor =
    variant === 'maroon'
      ? '#8C2F22'
      : variant === 'ivory'
      ? '#EFE3CE'
      : '#C99A3D';

  return (
    <div className={`flex w-full items-center justify-center py-4 ${className}`}>
      <svg
        viewBox="0 0 400 30"
        className="w-full max-w-xl h-8 opacity-90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Repeating Stepped Gopuram Tiers */}
        <path
          d="M0 28 H120 V20 H140 V12 H160 V4 H200 V4 H240 V12 H260 V20 H280 V28 H400"
          stroke={fillColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="200" cy="4" r="3" fill={fillColor} />
      </svg>
    </div>
  );
};

interface GopuramProgressRailProps {
  steps: string[];
  currentStep: number;
}

export const GopuramProgressRail: React.FC<GopuramProgressRailProps> = ({
  steps,
  currentStep
}) => {
  return (
    <div className="w-full bg-ivory/60 border border-turmeric/30 rounded-xl p-3 sm:p-4 mb-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between relative">
        {steps.map((label, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={label} className="flex flex-col items-center z-10 flex-1 px-1">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-kumkum text-ivory ring-2 sm:ring-4 ring-turmeric/50 shadow-md scale-105 sm:scale-110'
                    : isActive
                    ? 'bg-turmeric text-ink font-bold'
                    : 'bg-ivory-dark text-textInk/40 border border-turmeric/20'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-1.5 text-[9px] sm:text-xs font-medium text-center leading-tight max-w-[70px] sm:max-w-none ${
                  isCurrent ? 'text-kumkum font-bold' : isActive ? 'text-textInk font-semibold' : 'text-textInk/50'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}

        {/* Connecting Stepped Rail Background */}
        <div className="absolute top-4 sm:top-5 left-6 sm:left-8 right-6 sm:right-8 h-1 bg-ivory-dark -z-0">
          <div
            className="h-full bg-gradient-to-r from-turmeric to-kumkum transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
