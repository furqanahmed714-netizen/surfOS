import React from 'react';

// Style constants for the "Cute" aesthetic
const STROKE_COLOR = "#43302b"; // Warm dark brown for outlines
const STROKE_WIDTH = "3";

export const SurfCenterpiece: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
      <svg viewBox="0 0 800 600" className="w-[900px] h-[700px] max-w-[90vw] max-h-[80vh]">
        <defs>
          <filter id="paper-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>

        {/* Center Group */}
        <g transform="translate(400, 300)" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
          
          {/* --- BACKGROUND ELEMENTS --- */}
          
          {/* Sun */}
          <circle cx="150" cy="-150" r="40" fill="#fcd34d" stroke={STROKE_COLOR} />
          <g stroke={STROKE_COLOR} strokeWidth="3">
             <line x1="150" y1="-200" x2="150" y2="-210" />
             <line x1="150" y1="-100" x2="150" y2="-90" />
             <line x1="100" y1="-150" x2="90" y2="-150" />
             <line x1="200" y1="-150" x2="210" y2="-150" />
             <line x1="115" y1="-185" x2="108" y2="-192" />
             <line x1="185" y1="-115" x2="192" y2="-108" />
             <line x1="115" y1="-115" x2="108" y2="-108" />
             <line x1="185" y1="-185" x2="192" y2="-192" />
          </g>

          {/* Palm Tree (Behind Van) */}
          <g transform="translate(-120, -60)">
             {/* Trunk */}
             <path d="M20 100 Q 40 50 20 0" fill="none" stroke={STROKE_COLOR} strokeWidth="8" />
             {/* Leaves */}
             <path d="M20 0 Q -20 -20 -40 10" fill="#4ade80" />
             <path d="M20 0 Q 0 -40 -30 -30" fill="#22c55e" />
             <path d="M20 0 Q 40 -50 70 -30" fill="#4ade80" />
             <path d="M20 0 Q 80 -20 80 20" fill="#22c55e" />
             <path d="M20 0 Q 60 40 30 50" fill="#4ade80" />
             
             {/* Coconuts */}
             <circle cx="15" cy="5" r="6" fill="#78350f" />
             <circle cx="25" cy="5" r="6" fill="#78350f" />
          </g>

          {/* Sand Patch */}
          <ellipse cx="0" cy="110" rx="180" ry="40" fill="#fde047" stroke={STROKE_COLOR} />
          <path d="M-150 110 Q 0 160 150 110" fill="#eab308" stroke="none" opacity="0.2" />

          {/* --- THE CUTE SURF VAN --- */}
          <g transform="translate(-100, -20)">
            
            {/* Roof Rack & Surfboards */}
            <path d="M30 10 L 170 10" stroke={STROKE_COLOR} strokeWidth="4" />
            <path d="M30 10 L 30 30 M 170 10 L 170 30" stroke={STROKE_COLOR} strokeWidth="3" />
            
            {/* Board 1 */}
            <path d="M20 5 Q 100 -10 180 5 Q 180 15 20 15 Z" fill="#f472b6" /> 
            <path d="M40 5 V 15 M 160 5 V 15" stroke={STROKE_COLOR} /> {/* Straps */}
            
            {/* Board 2 (Behind) */}
            <path d="M25 -5 Q 100 -15 175 -5 Q 175 5 25 5 Z" fill="#67e8f9" />

            {/* Van Body Main Shape */}
            <path d="M0 100 L 0 50 Q 0 20 30 20 L 170 20 Q 200 20 200 50 L 200 100 Q 200 110 190 110 L 10 110 Q 0 110 0 100 Z" fill="#2dd4bf" />
            
            {/* Cream Stripe / Top Half */}
            <path d="M0 60 L 200 60 L 200 50 Q 200 20 170 20 L 30 20 Q 0 20 0 50 Z" fill="#f0fdf4" />
            <path d="M0 60 Q 100 80 200 60" fill="#f0fdf4" stroke="none" /> {/* V Shape detail */}
            <path d="M0 60 Q 100 80 200 60" fill="none" stroke={STROKE_COLOR} />

            {/* Windows */}
            <rect x="20" y="28" width="50" height="25" rx="4" fill="#a5f3fc" /> {/* Driver */}
            <rect x="80" y="28" width="50" height="25" rx="4" fill="#a5f3fc" /> {/* Passenger/Side */}
            <rect x="140" y="28" width="40" height="25" rx="4" fill="#a5f3fc" /> {/* Rear */}

            {/* NANO BANANA CHARACTER (In Middle Window) */}
            <g transform="translate(105, 53)">
               <path d="M-10 0 Q 0 -20 10 0" fill="#facc15" stroke="none" />
               <path d="M-10 0 Q 0 -20 10 0" fill="none" stroke={STROKE_COLOR} strokeWidth="2" />
               <path d="M-8 -5 H 8" strokeWidth="3" stroke="black" /> {/* Shades */}
               <path d="M10 -5 L 20 -15" stroke={STROKE_COLOR} strokeWidth="2" /> {/* Waving Arm */}
               <circle cx="20" cy="-15" r="2" fill="#facc15" stroke={STROKE_COLOR} /> {/* Hand */}
            </g>

            {/* "SURF" Text on Side */}
            <g transform="translate(100, 90)">
              <text textAnchor="middle" fontSize="24" fontFamily="'Righteous', cursive" fill="#facc15" stroke={STROKE_COLOR} strokeWidth="1.5">SURF</text>
            </g>

            {/* Wheels */}
            <circle cx="40" cy="110" r="20" fill="#1e293b" />
            <circle cx="40" cy="110" r="10" fill="#94a3b8" />
            <circle cx="160" cy="110" r="20" fill="#1e293b" />
            <circle cx="160" cy="110" r="10" fill="#94a3b8" />

            {/* Headlight & Bumper */}
            <circle cx="10" cy="80" r="8" fill="#fef08a" />
            <rect x="-5" y="100" width="10" height="15" rx="2" fill="#94a3b8" />
            <rect x="195" y="100" width="10" height="15" rx="2" fill="#94a3b8" />
          </g>

          {/* --- FOREGROUND ITEMS --- */}

          {/* Beach Ball */}
          <g transform="translate(80, 110) rotate(-20)">
            <circle cx="0" cy="0" r="15" fill="white" stroke={STROKE_COLOR} />
            <path d="M0 -15 Q 8 0 0 15" fill="none" stroke={STROKE_COLOR} />
            <path d="M0 -15 Q -8 0 0 15" fill="none" stroke={STROKE_COLOR} />
            <path d="M-15 0 Q 0 0 15 0" fill="none" stroke={STROKE_COLOR} />
            
            {/* Color segments (simulated with clipping or just overlay) */}
            <path d="M0 -15 Q 8 0 0 15 A 15 15 0 0 1 0 -15" fill="#ef4444" opacity="0.3" stroke="none" />
            <path d="M0 -15 Q -8 0 0 15 A 15 15 0 0 0 0 -15" fill="#3b82f6" opacity="0.3" stroke="none" />
          </g>

          {/* Little Crab */}
          <g transform="translate(-60, 120)">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#ef4444" />
            <path d="M-10 -2 L -15 -8 M 10 -2 L 15 -8" stroke={STROKE_COLOR} />
            <path d="M-5 4 L -8 10 M 5 4 L 8 10" stroke={STROKE_COLOR} />
            <circle cx="-4" cy="-2" r="1" fill="white" stroke="none" />
            <circle cx="4" cy="-2" r="1" fill="white" stroke="none" />
            <path d="M-15 -8 L -18 -10 L -14 -12 Z" fill="#ef4444" />
            <path d="M15 -8 L 18 -10 L 14 -12 Z" fill="#ef4444" />
          </g>

          {/* The 90/10 Sign (Cute version) */}
           <g transform="translate(130, 90) rotate(5)">
              <path d="M0 0 V 40" stroke="#78350f" strokeWidth="4" /> 
              <rect x="-15" y="-5" width="30" height="20" fill="#fef3c7" rx="2" stroke={STROKE_COLOR} />
              <text x="0" y="8" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#78350f" stroke="none" fontWeight="bold">90/10</text>
           </g>

        </g>
      </svg>
    </div>
  );
};
