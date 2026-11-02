import React from 'react';

interface UK2NaijaLogoProps {
  variant?: 'default' | 'compact' | 'light' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UK2NaijaLogo: React.FC<UK2NaijaLogoProps> = ({
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
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const subTextSizes = {
    sm: 'text-[8px]',
    md: 'text-[9.5px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bidirectional Flow Emblem (UK ⇄ Naija) */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1.5 shadow-sm border ${
          isLight ? 'border-slate-700/60 shadow-slate-950/40' : 'border-slate-800 shadow-slate-900/10'
        } flex items-center justify-center shrink-0 group`}
        title="UK2Naija: Direct Bidirectional UK ⇄ Nigeria Trade Corridor"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
        >
          {/* Subtle background glow/corridor circuit */}
          <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="2 3" />

          {/* Outbound Arrow: UK ➔ Naija (Emerald Path, flowing Top-Left to Top-Right) */}
          <path
            d="M 10 14 C 15 11, 25 11, 29 14"
            stroke="url(#emeraldFlow)"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          {/* Top Arrowhead pointing East (➔ Nigeria) */}
          <path
            d="M 26 10.5 L 30 14 L 26 17.5"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inbound Arrow: Naija ➔ UK (Counter-flow Path, flowing Bottom-Right to Bottom-Left) */}
          <path
            d="M 30 26 C 25 29, 15 29, 11 26"
            stroke="url(#azureFlow)"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          {/* Bottom Arrowhead pointing West (⬅ UK) */}
          <path
            d="M 14 22.5 L 10 26 L 14 29.5"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dynamic Center Nexus: Stylized numeral 2 connecting both streams */}
          <circle cx="20" cy="20" r="3" fill="#10b981" />
          <circle cx="20" cy="20" r="1.25" fill="#f8fafc" />

          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldFlow" x1="10" y1="12" x2="30" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="azureFlow" x1="30" y1="28" x2="10" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: UK2Naija Brand Mark */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className={`flex items-center tracking-tight leading-none ${textSizes[size]}`}>
            <span className={`font-black ${isLight ? 'text-white' : 'text-slate-900'}`}>UK</span>
            <span className="font-extrabold text-emerald-500 px-0.5 relative">
              2
              {/* Micro bidirectional arrows above/below '2' */}
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] text-emerald-400 font-sans tracking-tighter opacity-80">
                ⇄
              </span>
            </span>
            <span className={`font-black ${isLight ? 'text-emerald-400' : 'text-emerald-600'}`}>Naija</span>
            
            {variant === 'default' && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isLight 
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span>UK</span>
                <span className="text-[9px]">⇄</span>
                <span>Naija</span>
              </span>
            )}
          </div>

          {variant === 'default' && (
            <p className={`font-medium tracking-tight mt-0.5 flex items-center gap-1 ${subTextSizes[size]} ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>Bidirectional UK & Nigeria Trade Corridor</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
