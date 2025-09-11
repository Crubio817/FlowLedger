import React from 'react';

type SweepHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  maxWidthClass?: string; // allow overriding container width
  fullBleed?: boolean; // stretch background edge-to-edge
  divider?: boolean; // show bottom divider line
  density?: 'compact' | 'cozy' | 'comfortable'; // controls vertical padding
  bleedTop?: boolean;
  fadeBottom?: boolean;
};

// Animated sweep header with gradient accent line
// Matches the provided HTML/CSS but adapted to our Tailwind setup
const SweepHeader: React.FC<SweepHeaderProps> = ({
  title,
  subtitle,
  className = '',
  maxWidthClass = 'max-w-5xl',
  fullBleed = true,
  divider = false,
  density = 'cozy',
  bleedTop = false,
  fadeBottom = false,
}) => {
  // map density to padding values via CSS variables
  const padMap = {
    compact: { py: '28px', px: '16px' },
    cozy: { py: '44px', px: '28px' },
    comfortable: { py: '60px', px: '40px' },
  } as const;
  const pad = padMap[density];

  const styleVars: React.CSSProperties = {
    ['--header-py' as any]: pad.py,
    ['--header-px' as any]: pad.px,
    ['--header-divider-opacity' as any]: divider ? 0.1 : 0,
  };

  return (
    <header
      className={`sweep-header ${fullBleed ? 'full-bleed' : ''} ${bleedTop ? 'bleed-top' : ''} ${fadeBottom ? 'header-fade-bottom' : ''} ${className}`}
      style={styleVars as React.CSSProperties}
    >
      <div className={`mx-auto ${maxWidthClass} relative z-10`}>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          {title}
        </h1>
        <div className="accent-line mb-4" />
        {subtitle && (
          <p className="text-base md:text-lg leading-relaxed text-white/60 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
};

export default SweepHeader;
