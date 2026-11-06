import React from 'react';

interface JamluLogoProps {
  variant?: 'default' | 'compact' | 'light' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const JamluLogo: React.FC<JamluLogoProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const isLight = variant === 'light'; // For dark backgrounds like footer

  // Size configurations
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subTextSizes = {
    sm: 'text-[8.5px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bidirectional Flow Emblem (UK ⇄ Naija) */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-[#102B2A] via-[#162220] to-[#102B2A] p-1 shadow-sm border ${
          isLight ? 'border-white/10 shadow-black/40' : 'border-[#263A35] shadow-stone-900/10'
        } flex items-center justify-center shrink-0 group overflow-hidden`}
        title="Jamlu: UK ⇄ Nigeria Direct Sourcing & Delivery"
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        >
          {/* Subtle background glow/corridor circuit */}
          <circle cx="22" cy="22" r="19" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 3" />

          {/* Top Inscription: 'UK' neatly inside emblem */}
          <text
            x="22"
            y="9.5"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="6"
            fontWeight="900"
            letterSpacing="0.08em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            UK
          </text>

          {/* Outbound Arrow: UK ➔ Naija (Gold/Emerald Flow) */}
          <path
            d="M 12 16.5 C 17 14, 27 14, 32 16.5"
            stroke="url(#emeraldFlow)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Top Arrowhead pointing East (➔ Nigeria) */}
          <path
            d="M 29 13.5 L 33 16.5 L 29 19.5"
            stroke="#D9B77A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inbound Arrow: Naija ➔ UK (Azure Counter-flow Path) */}
          <path
            d="M 32 26.5 C 27 29, 17 29, 12 26.5"
            stroke="url(#azureFlow)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Bottom Arrowhead pointing West (⬅ UK) */}
          <path
            d="M 15 23.5 L 11 26.5 L 15 29.5"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Beneath Inscription: 'Naija' neatly inside emblem */}
          <text
            x="22"
            y="37"
            textAnchor="middle"
            fill="#34d399"
            fontSize="5.5"
            fontWeight="800"
            letterSpacing="0.04em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Naija
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldFlow" x1="12" y1="15" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D9B77A" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="azureFlow" x1="32" y1="28" x2="11" y2="26.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: Jamlu Brand Mark */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className={`flex items-baseline tracking-tight leading-none ${textSizes[size]}`}>
            <span className={`font-black ${isLight ? 'text-white' : 'text-[#102B2A]'}`}>Jam</span>
            <span className="font-black text-[#D9B77A]">lu</span>
          </div>

          {variant === 'default' && (
            <p className={`font-semibold tracking-tight mt-0.5 flex items-center gap-1 ${subTextSizes[size]} ${
              isLight ? 'text-stone-300' : 'text-stone-600'
            }`}>
              <span>UK ⇄ Nigeria Trade Corridor</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Aliased export for compatibility
export const UK2NaijaLogo = JamluLogo;
