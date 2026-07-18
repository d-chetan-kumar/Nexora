import React from 'react';

export default function MosaicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[-1] overflow-hidden bg-paper">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mosaic-pattern" width="400" height="400" patternUnits="userSpaceOnUse">
            {/* Interlocking rectangular panels with 0.5px line width at 30% opacity */}
            <path
              d="M 0,0 L 400,0 M 0,0 L 0,400 M 200,0 L 200,200 M 0,200 L 400,200 M 100,200 L 100,400 M 300,0 L 300,400 M 0,100 L 200,100 M 200,300 L 400,300"
              fill="none"
              stroke="#3A3A38"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mosaic-pattern)" />
      </svg>
    </div>
  );
}
