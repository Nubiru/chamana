/**
 * ThreadLine Component
 *
 * CHAMANA Brand Graphic Element
 * Creates thread-like lines that emulate movement of Air, Water, Fire, Earth, and Ether/Thread (hilo)
 * These lines morphologically resemble thread movement, reflecting the brand's connection to nature and fluidity
 */

import { cn } from '@/lib/utils';
import type * as React from 'react';

export type ThreadMovement = 'air' | 'water' | 'fire' | 'earth' | 'ether';

interface ThreadLineProps {
  /**
   * Type of movement to emulate
   * - air: Light, flowing, upward movement
   * - water: Smooth, wave-like, horizontal flow
   * - fire: Dynamic, upward flickering
   * - earth: Grounded, stable, horizontal
   * - ether: Abstract, flowing, organic curves
   */
  movement?: ThreadMovement;
  /**
   * Width of the line
   */
  width?: number | string;
  /**
   * Height of the line
   */
  height?: number | string;
  /**
   * Color of the line (uses brand colors by default)
   */
  color?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Animation enabled (subtle flow animation)
   */
  animated?: boolean;
}

/**
 * Generate SVG path for different movement types
 */
function getPathForMovement(
  movement: ThreadMovement,
  width: number,
  height: number
): string {
  const w = width;
  const h = height;
  const midY = h / 2;

  switch (movement) {
    case 'air':
      // Light, flowing, upward movement - gentle curves rising
      return `M 0 ${h * 0.7} Q ${w * 0.25} ${h * 0.3} ${
        w * 0.5
      } ${midY} T ${w} ${h * 0.2}`;

    case 'water':
      // Smooth, wave-like, horizontal flow
      return `M 0 ${midY} Q ${w * 0.25} ${h * 0.3} ${
        w * 0.5
      } ${midY} T ${w} ${midY} Q ${w * 0.75} ${h * 0.7} ${
        w * 0.5
      } ${midY} T 0 ${midY}`;

    case 'fire':
      // Dynamic, upward flickering - sharp peaks
      return `M 0 ${h * 0.8} L ${w * 0.2} ${h * 0.4} L ${w * 0.3} ${
        h * 0.6
      } L ${w * 0.5} ${h * 0.2} L ${w * 0.7} ${h * 0.5} L ${w * 0.8} ${
        h * 0.3
      } L ${w} ${h * 0.1}`;

    case 'earth':
      // Grounded, stable, horizontal - subtle undulation
      return `M 0 ${h * 0.6} Q ${w * 0.2} ${h * 0.5} ${w * 0.4} ${h * 0.55} Q ${
        w * 0.6
      } ${h * 0.6} ${w * 0.8} ${h * 0.55} T ${w} ${h * 0.6}`;

    default:
      // Abstract, flowing, organic curves - most fluid (ether)
      return `M 0 ${h * 0.5} C ${w * 0.2} ${h * 0.2} ${w * 0.4} ${h * 0.8} ${
        w * 0.6
      } ${h * 0.3} C ${w * 0.8} ${h * 0.7} ${w * 0.9} ${h * 0.1} ${w} ${
        h * 0.5
      }`;
  }
}

export function ThreadLine({
  movement = 'ether',
  width = 200,
  height = 100,
  color = 'oklch(0.64 0.02 130)', // Meadow brand color
  className,
  animated = true
}: ThreadLineProps) {
  const numWidth =
    typeof width === 'string' ? Number.parseInt(width, 10) : width;
  const numHeight =
    typeof height === 'string' ? Number.parseInt(height, 10) : height;
  const path = getPathForMovement(movement, numWidth, numHeight);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numWidth} ${numHeight}`}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        {animated && (
          <style>
            {`
              @keyframes threadFlow {
                0%, 100% { 
                  stroke-dashoffset: 0;
                  opacity: 0.8;
                }
                50% { 
                  stroke-dashoffset: 20;
                  opacity: 1;
                }
              }
              .thread-path {
                animation: threadFlow 3s ease-in-out infinite;
              }
            `}
          </style>
        )}
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'thread-path' : ''}
        style={{
          strokeDasharray: animated ? '10 5' : 'none'
        }}
      />
    </svg>
  );
}

/**
 * ThreadLine Decorative - Pre-configured decorative variations
 */
export function ThreadLineDecorative({
  variant = 'subtle',
  className
}: {
  variant?: 'subtle' | 'accent' | 'bold';
  className?: string;
}) {
  const variants = {
    subtle: {
      movement: 'water' as ThreadMovement,
      color: 'oklch(0.88 0.03 65 / 0.3)', // Lily Primary with low opacity
      width: 150,
      height: 50
    },
    accent: {
      movement: 'ether' as ThreadMovement,
      color: 'oklch(0.64 0.02 130)', // Meadow
      width: 200,
      height: 80
    },
    bold: {
      movement: 'fire' as ThreadMovement,
      color: 'oklch(0.20 0.01 180)', // Forest Primary
      width: 250,
      height: 100
    }
  };

  const config = variants[variant];

  return (
    <ThreadLine
      movement={config.movement}
      color={config.color}
      width={config.width}
      height={config.height}
      className={className}
      animated={variant !== 'bold'}
    />
  );
}
