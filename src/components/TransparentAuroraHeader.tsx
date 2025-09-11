import React from 'react';

type TransparentAuroraHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  maxWidthClass?: string;
  fullBleed?: boolean;
  divider?: boolean;
  density?: 'compact' | 'cozy' | 'comfortable';
  bleedTop?: boolean;
  fadeBottom?: boolean;
  contentClassName?: string;
  colors?: { sweep?: string; aurora1?: string; aurora2?: string };
  titleClassName?: string;
  subtitleClassName?: string;
  fadeHeight?: string | number; // controls the bottom fade height
  auroraOffset?: string; // controls horizontal positioning of aurora effects
};

const TransparentAuroraHeader: React.FC<TransparentAuroraHeaderProps> = ({
  title,
  subtitle,
  className = '',
  maxWidthClass = 'max-w-5xl',
  fullBleed = true,
  divider = false,
  density = 'compact',
  bleedTop = true,
  fadeBottom = true,
  contentClassName = '',
  colors,
  titleClassName,
  subtitleClassName,
  fadeHeight,
  auroraOffset = '-25%',
}) => {
  const padMap = {
    compact: { py: '32px', px: '16px' },
    cozy: { py: '44px', px: '28px' },
    // Slightly reduce the tallest density to trim overall header height
    comfortable: { py: '52px', px: '40px' },
  } as const;
  const pad = padMap[density];

  const styleVars: React.CSSProperties = {
    ['--header-py' as any]: pad.py,
    ['--header-px' as any]: pad.px,
    ['--header-divider-opacity' as any]: divider ? 0.1 : 0,
    ['--aurora-offset' as any]: auroraOffset,
    ...(colors?.sweep ? ({ ['--sweep-color' as any]: colors.sweep } as React.CSSProperties) : {}),
    ...(colors?.aurora1 ? ({ ['--aurora1' as any]: colors.aurora1 } as React.CSSProperties) : {}),
    ...(colors?.aurora2 ? ({ ['--aurora2' as any]: colors.aurora2 } as React.CSSProperties) : {}),
    ...(fadeBottom && fadeHeight ? ({ ['--header-fade-h' as any]: typeof fadeHeight === 'number' ? `${fadeHeight}px` : fadeHeight } as React.CSSProperties) : {}),
  };

  return (
    <header
      className={`aurora-header ${fullBleed ? 'full-bleed' : ''} ${bleedTop ? 'bleed-top' : ''} ${fadeBottom ? 'header-fade-bottom' : ''} ${className}`}
      style={styleVars as React.CSSProperties}
    >
      {/* Subtle Aurora layers */}
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      
      {/* 3D Horizon Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main horizon line with 3D depth - SILVER PLATINUM */}
        
        {/* Option 1: Pure White Glow */}
        {/* <div 
          className="absolute left-0 right-0 h-1"
          style={{
            top: '92%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 80%, transparent)',
            boxShadow: `
              0 0 20px rgba(255,255,255,0.6),
              0 4px 20px rgba(255,255,255,0.3),
              0 -4px 20px rgba(255,255,255,0.2)
            `,
            filter: 'blur(0.5px)'
          }}
        /> */}
        
        {/* Option 2: Silver Platinum Glow - ACTIVE */}
        <div 
          className="absolute left-0 right-0 h-1"
          style={{
            top: '92%',
            background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.8) 20%, rgba(230,230,230,0.9) 50%, rgba(192,192,192,0.8) 80%, transparent)',
            boxShadow: `
              0 0 20px rgba(192,192,192,0.6),
              0 4px 20px rgba(230,230,230,0.3),
              0 -4px 20px rgba(192,192,192,0.2)
            `,
            filter: 'blur(0.5px)'
          }}
        />
        
        {/* Option 3: Warm Silver Glow */}
        {/* <div 
          className="absolute left-0 right-0 h-1"
          style={{
            top: '92%',
            background: 'linear-gradient(90deg, transparent, rgba(220,220,220,0.8) 20%, rgba(245,245,245,0.9) 50%, rgba(220,220,220,0.8) 80%, transparent)',
            boxShadow: `
              0 0 20px rgba(220,220,220,0.6),
              0 4px 20px rgba(245,245,245,0.3),
              0 -4px 20px rgba(220,220,220,0.2)
            `,
            filter: 'blur(0.5px)'
          }}
        /> */}
        
        {/* Option 4: Cool Silver Blue Glow */}
        {/* <div 
          className="absolute left-0 right-0 h-1"
          style={{
            top: '92%',
            background: 'linear-gradient(90deg, transparent, rgba(200,210,220,0.8) 20%, rgba(240,245,250,0.9) 50%, rgba(200,210,220,0.8) 80%, transparent)',
            boxShadow: `
              0 0 20px rgba(200,210,220,0.6),
              0 4px 20px rgba(240,245,250,0.3),
              0 -4px 20px rgba(200,210,220,0.2)
            `,
            filter: 'blur(0.5px)'
          }}
        /> */}
        
        {/* Perspective depth lines - matching silver platinum theme */}
        <div 
          className="absolute left-0 right-0 h-px"
          style={{
            top: '89%',
            background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.4) 30%, rgba(230,230,230,0.5) 50%, rgba(192,192,192,0.4) 70%, transparent)',
            boxShadow: '0 0 10px rgba(192,192,192,0.3)'
          }}
        />
        
        <div 
          className="absolute left-0 right-0 h-px"
          style={{
            top: '95%',
            background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.3) 40%, rgba(230,230,230,0.4) 50%, rgba(192,192,192,0.3) 60%, transparent)',
            boxShadow: '0 0 8px rgba(192,192,192,0.2)'
          }}
        />
        
        {/* Futuristic grid pattern for wall effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(16,185,129,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 20px',
            transform: 'perspective(200px) rotateX(15deg)',
            transformOrigin: 'center 95%'
          }}
        />
      </div>

      <div className={`mx-auto ${maxWidthClass} relative z-10 ${contentClassName}`}>
        <div className="flex items-center gap-6">
          <div>
            <h1 className={titleClassName || 'aurora-title text-4xl md:text-5xl font-bold tracking-tight text-white mb-3'}>
              {title}
            </h1>
          </div>
          {subtitle && (
            <div className="flex-1">
              <p className={subtitleClassName || 'text-base md:text-lg leading-relaxed text-white/60 max-w-2xl'}>
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="accent-line accent-line--shimmer mb-3" />
      </div>
    </header>
  );
};

export default TransparentAuroraHeader;
