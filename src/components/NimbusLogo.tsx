import React from 'react';

interface NimbusLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const NimbusIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5 text-[#111113]',
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud-inspired geometric mark combined with subtle security shield element */}
      <path
        d="M6.5 17.5H17.5C19.7091 17.5 21.5 15.7091 21.5 13.5C21.5 11.4589 19.9678 9.77536 17.986 9.53106C17.5029 6.42571 14.8388 4 11.5 4C8.42398 4 5.92248 6.06283 5.21557 8.87853C3.39343 9.42152 2 11.1037 2 13.1C2 15.5301 3.96995 17.5 6.4 17.5H6.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Centered geometric shield integrated into cloud */}
      <path
        d="M12 8.5L16.2 10.2V13.8C16.2 16.5 14.4 18.9 12 19.8C9.6 18.9 7.8 16.5 7.8 13.8V10.2L12 8.5Z"
        fill="#E63946"
        fillOpacity="0.25"
        stroke="#E63946"
        strokeWidth="2"
        strokeLinecap="square"
      />
      {/* Core shield point */}
      <rect x="11" y="12.5" width="2" height="2" fill="#E63946" />
    </svg>
  );
};

export const NimbusLogo: React.FC<NimbusLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  iconOnly = false,
}) => {
  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-extrabold',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${containerSizes[size]} bg-transparent border-2 border-[#111113] flex items-center justify-center shrink-0`}
      >
        <NimbusIcon size={iconSizes[size]} className="text-[#111113]" />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <span className={`font-syne uppercase tracking-tight text-[#111113] ${textSizes[size]}`}>
            NIMBUS
          </span>
          {showTagline && (
            <span className="text-[10px] text-[#111113]/70 font-mono uppercase tracking-wider leading-tight">
              Simple security intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
