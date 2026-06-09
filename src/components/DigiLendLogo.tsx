import React from "react";
import { LOGO_PATH, LOGO_BASE64 } from "../BrandAssets";

interface DigiLendLogoProps {
  size?: "sm" | "md" | "lg";
  layout?: "vertical" | "horizontal";
  showText?: boolean;
}

export const DigiLendLogo: React.FC<DigiLendLogoProps> = ({
  size = "md",
  layout = "horizontal",
  showText = true,
}) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  // Crisp dimensions matching original UX profiles
  const iconSizeClass = isSm ? "w-10 h-10" : isLg ? "w-28 h-28" : "w-16 h-16";
  const titleClass = isSm ? "text-lg font-black tracking-tight" : isLg ? "text-4xl font-black tracking-tight sm:text-5xl" : "text-2xl font-black tracking-tight";
  const subClass = isSm ? "text-[8.5px] tracking-widest" : isLg ? "text-[12px] tracking-widest" : "text-[10px] tracking-widest";

  return (
    <div className={`flex ${layout === "vertical" ? "flex-col items-center text-center space-y-3.5" : "items-center space-x-3.5"} transition-all duration-300`}>
      {/* Absolute source lock for the asset logo - NO text fallbacks, NO vector replacements */}
      <div className={`${iconSizeClass} flex items-center justify-center select-none shrink-0 group relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.1]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* The main glowing brand gradient from intense orange to deeper warm red-orange */}
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A00" />
              <stop offset="100%" stopColor="#E65C00" />
            </linearGradient>

            {/* Inner golden gradient for details & accents */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="100%" stopColor="#FF9100" />
            </linearGradient>

            {/* Orbit sweep gradient */}
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#FFD54F" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF7A00" stopOpacity="0.8" />
            </linearGradient>

            {/* A 3D drop shadow filter for deep contrast against any darker background */}
            <filter id="c_shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
            </filter>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACK PATH OF THE ORBITAL RING (passes behind the shield) */}
          <path
            d="M 12 56 C 12 40, 88 40, 88 56"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            transform="rotate(-20 50 50)"
            opacity="0.8"
          />

          {/* BACKGROUND BRANDING GLOW */}
          <circle cx="50" cy="50" r="30" fill="#FF7A00" opacity="0.15" filter="url(#glow)" />

          {/* THE MASTER SHIELD ICON */}
          <path
            d="M 50 15 L 82 24 C 82 52, 72 74, 50 86 C 28 74, 18 52, 18 24 Z"
            fill="url(#shieldGrad)"
            filter="url(#c_shadow)"
            stroke="#FFE082"
            strokeWidth="1.5"
          />

          {/* INNER WHITE GLOSSY ACCENT border for that premium visual depth */}
          <path
            d="M 50 19 L 77 26.5 C 77 49.5, 68.5 68, 50 78.5 C 31.5 68, 23 49.5, 23 26.5 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            opacity="0.35"
          />

          {/* STYLIZED WHITE BRAND INITIAL "D" WITH EXTRA CHARACTER */}
          {/* Beautifully balanced letter "D" crafted layout with custom rounded edge-cut */}
          <path
            d="M 40 33 H 49 C 58 33, 63.5 37.5, 63.5 48.5 C 63.5 59.5, 58 63.5, 49 63.5 H 40 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* GOLD-ORANGE RUPEE SYMBOL "₹" LOCATED ELEGANTLY AT THE INNER EMBLEM CENTER */}
          <text
            x="48"
            y="55"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="url(#goldGrad)"
            textAnchor="middle"
          >
            ₹
          </text>

          {/* FRONT PATH OF THE ORBITAL RING (passes in front of the shield for 3D overlap) */}
          <path
            d="M 88 56 C 88 72, 12 72, 12 56"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            transform="rotate(-20 50 50)"
            filter="url(#c_shadow)"
          />

          {/* MULTI-ORBITAL SPEED SPARKLES */}
          <circle cx="82" cy="42" r="1.5" fill="#FFE082" />
          <circle cx="16" cy="62" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className={`${layout === "vertical" ? "text-center" : "text-left"} select-none leading-none`}>
          <div className={`flex items-center space-x-1.5 ${layout === "vertical" ? "justify-center" : ""}`}>
            <span className={`${titleClass} text-white leading-tight font-sans font-black`}>DigiLend</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse"></span>
          </div>
          <p className={`${subClass} text-[#FF7A00]/90 uppercase font-mono font-black tracking-widest mt-1.5`}>
            FAST • SECURE • DIGITAL
          </p>
        </div>
      )}
    </div>
  );
};
