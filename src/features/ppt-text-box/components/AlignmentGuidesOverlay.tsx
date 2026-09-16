import React from 'react';
import type { SnapGuide } from '../types/textbox.types';

interface Props {
  guides: SnapGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

export const AlignmentGuidesOverlay: React.FC<Props> = ({ guides, canvasWidth, canvasHeight }) => {
  if (!guides || guides.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-50 overflow-visible"
      width={canvasWidth}
      height={canvasHeight}
    >
      {guides.map((guide, idx) => {
        if (guide.type === 'vertical') {
          return (
            <g key={`v-${idx}`}>
              {/* Dashed alignment line */}
              <line
                x1={guide.position}
                y1={Math.max(0, guide.start)}
                x2={guide.position}
                y2={Math.min(canvasHeight, guide.end)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Target Indicator crosshairs */}
              <circle cx={guide.position} cy={guide.start} r="3" fill="#ef4444" />
              <circle cx={guide.position} cy={guide.end} r="3" fill="#ef4444" />
            </g>
          );
        } else {
          return (
            <g key={`h-${idx}`}>
              {/* Dashed alignment line */}
              <line
                x1={Math.max(0, guide.start)}
                y1={guide.position}
                x2={Math.min(canvasWidth, guide.end)}
                y2={guide.position}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Target Indicator crosshairs */}
              <circle cx={guide.start} cy={guide.position} r="3" fill="#ef4444" />
              <circle cx={guide.end} cy={guide.position} r="3" fill="#ef4444" />
            </g>
          );
        }
      })}
    </svg>
  );
};
