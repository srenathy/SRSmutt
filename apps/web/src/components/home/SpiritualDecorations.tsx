import React from 'react';

export const MandalaPattern: React.FC<{ className?: string; size?: number; opacity?: number }> = ({
  className = '',
  size = 400,
  opacity = 0.04
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ opacity }}
  >
    {/* Concentric Sacred Mandala Circles & Petals */}
    <circle cx="200" cy="200" r="190" stroke="#C99A3D" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="200" cy="200" r="170" stroke="#8C2F22" strokeWidth="1" />
    <circle cx="200" cy="200" r="140" stroke="#C99A3D" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="110" stroke="#8C2F22" strokeWidth="1" strokeDasharray="6 3" />
    <circle cx="200" cy="200" r="80" stroke="#C99A3D" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="50" stroke="#8C2F22" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="20" stroke="#C99A3D" strokeWidth="2" fill="#C99A3D" fillOpacity="0.1" />

    {/* 8-Axis Petal Rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 200 200)`}>
        {/* Outer Lotus Petal */}
        <path
          d="M200 10 C215 70 235 120 200 160 C165 120 185 70 200 10 Z"
          stroke="#C99A3D"
          strokeWidth="1"
          fill="#C99A3D"
          fillOpacity="0.05"
        />
        {/* Inner Diamond Flourish */}
        <polygon
          points="200,90 208,120 200,150 192,120"
          stroke="#8C2F22"
          strokeWidth="0.75"
          fill="none"
        />
        {/* Radiating Ray */}
        <line x1="200" y1="20" x2="200" y2="180" stroke="#C99A3D" strokeWidth="0.5" />
        <circle cx="200" cy="15" r="3" fill="#8C2F22" />
      </g>
    ))}

    {/* 16-Axis Secondary Florets */}
    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 200 200)`}>
        <path
          d="M200 60 C208 100 215 130 200 150 C185 130 192 100 200 60 Z"
          stroke="#C99A3D"
          strokeWidth="0.75"
          fill="none"
        />
        <circle cx="200" cy="55" r="2" fill="#C99A3D" />
      </g>
    ))}
  </svg>
);

export const LotusIcon: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 24,
  color = '#8C2F22'
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Center Petal */}
    <path
      d="M24 6 C28 16 30 28 24 38 C18 28 20 16 24 6 Z"
      fill={color}
      fillOpacity="0.85"
    />
    {/* Left Inner Petal */}
    <path
      d="M24 16 C16 18 10 28 14 36 C18 36 22 34 24 30 Z"
      fill={color}
      fillOpacity="0.65"
    />
    {/* Right Inner Petal */}
    <path
      d="M24 16 C32 18 38 28 34 36 C30 36 26 34 24 30 Z"
      fill={color}
      fillOpacity="0.65"
    />
    {/* Left Outer Petal */}
    <path
      d="M20 26 C10 28 4 36 10 42 C16 42 20 38 22 34 Z"
      fill={color}
      fillOpacity="0.45"
    />
    {/* Right Outer Petal */}
    <path
      d="M28 26 C38 28 44 36 38 42 C32 42 28 38 26 34 Z"
      fill={color}
      fillOpacity="0.45"
    />
    {/* Lotus Base */}
    <path
      d="M16 42 C20 44 28 44 32 42 C30 40 18 40 16 42 Z"
      fill="#C99A3D"
    />
  </svg>
);

export const DiyaIcon: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 24,
  color = '#C99A3D'
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Flame */}
    <path
      d="M16 4 C18 9 20 12 18 15 C16 17 14 17 14 15 C12 12 14 9 16 4 Z"
      fill="#D97706"
    />
    <path
      d="M16 8 C17 11 18 13 17 15 C16 16 15 16 15 15 C14 13 15 11 16 8 Z"
      fill="#FCD34D"
    />
    {/* Diya Clay Base */}
    <path
      d="M6 18 C8 24 24 24 26 18 C28 17 28 21 24 25 C19 28 13 28 8 25 C4 21 4 17 6 18 Z"
      fill={color}
    />
    <ellipse cx="16" cy="18" rx="10" ry="2.5" fill="#8C2F22" fillOpacity="0.8" />
  </svg>
);

export const TempleArchMotif: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 py-3 ${className}`}>
    <div className="h-px bg-gradient-to-r from-transparent via-[#C99A3D]/40 to-[#C99A3D] flex-1 max-w-xs" />
    <div className="flex items-center gap-1.5 px-2 text-[#C99A3D]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D]" />
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="text-[#8C2F22]">
        <path d="M10 1 L19 14 H1 Z" stroke="#C99A3D" strokeWidth="1.5" fill="#8C2F22" fillOpacity="0.1" />
        <circle cx="10" cy="9" r="2.5" fill="#C99A3D" />
      </svg>
      <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D]" />
    </div>
    <div className="h-px bg-gradient-to-l from-transparent via-[#C99A3D]/40 to-[#C99A3D] flex-1 max-w-xs" />
  </div>
);
