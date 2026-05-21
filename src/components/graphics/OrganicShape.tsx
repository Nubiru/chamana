/**
 * OrganicShape Component
 *
 * CHAMANA Brand Graphic Element
 * Creates organic, flowing shapes using clip-path or SVG
 * Reflects the brand's natural, fluid aesthetic
 */

import { cn } from '@/lib/utils';
import type * as React from 'react';

export type OrganicShapeType = 'blob' | 'wave' | 'cloud' | 'leaf';

interface OrganicShapeProps {
  /**
   * Type of organic shape
   * - blob: Fluid, amoeba-like shape
   * - wave: Gentle wave form
   * - cloud: Soft, cloud-like shape
   * - leaf: Nature-inspired leaf form
   */
  type?: OrganicShapeType;
  /**
   * Width of the shape
   */
  width?: number | string;
  /**
   * Height of the shape
   */
  height?: number | string;
  /**
   * Background color (uses brand colors by default)
   */
  color?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Opacity of the shape
   */
  opacity?: number;
}

/**
 * Generate SVG path for organic shapes
 */
function getSVGPathForType(type: OrganicShapeType, width: number, height: number): string {
  const w = width;
  const h = height;
  const midX = w / 2;
  const midY = h / 2;

  switch (type) {
    case 'blob':
      return `M ${midX} 0 C ${w * 0.7} 0 ${w} ${h * 0.3} ${w} ${midY} C ${w} ${
        h * 0.7
      } ${w * 0.7} ${h} ${midX} ${h} C ${w * 0.3} ${h} 0 ${
        h * 0.7
      } 0 ${midY} C 0 ${h * 0.3} ${w * 0.3} 0 ${midX} 0 Z`;

    case 'wave':
      return `M 0 ${midY} Q ${w * 0.25} ${h * 0.2} ${
        w * 0.5
      } ${midY} T ${w} ${midY} L ${w} ${h} L 0 ${h} Z`;

    case 'cloud':
      return `M ${w * 0.2} ${h * 0.6} Q ${w * 0.1} ${h * 0.4} ${w * 0.3} ${
        h * 0.3
      } Q ${w * 0.2} ${h * 0.1} ${w * 0.5} ${h * 0.2} Q ${w * 0.7} ${h * 0.1} ${
        w * 0.8
      } ${h * 0.3} Q ${w * 0.9} ${h * 0.2} ${w} ${h * 0.4} L ${w} ${h} L 0 ${h} Z`;

    default:
      // Nature-inspired leaf form
      return `M ${midX} 0 Q ${w} ${h * 0.3} ${w * 0.8} ${
        h * 0.7
      } Q ${midX} ${h} ${w * 0.2} ${h * 0.7} Q 0 ${h * 0.3} ${midX} 0 Z`;
  }
}

export function OrganicShape({
  type = 'blob',
  width = 200,
  height = 200,
  color = 'oklch(0.88 0.03 65)', // Lily Primary brand color
  className,
  opacity = 0.1,
}: OrganicShapeProps) {
  const numWidth = typeof width === 'string' ? Number.parseInt(width, 10) : width;
  const numHeight = typeof height === 'string' ? Number.parseInt(height, 10) : height;
  const svgPath = getSVGPathForType(type, numWidth, numHeight);

  return (
    <div
      className={cn('absolute pointer-events-none', className)}
      style={{
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
      }}
    >
      <svg
        width={numWidth}
        height={numHeight}
        viewBox={`0 0 ${numWidth} ${numHeight}`}
        className="w-full h-full"
        aria-hidden="true"
      >
        <path d={svgPath} fill={color} opacity={opacity} className="animate-gentle-pulse" />
      </svg>
    </div>
  );
}

/**
 * OrganicShape Background - Pre-configured decorative background shapes
 */
export function OrganicShapeBackground({
  variant = 'subtle',
  className,
}: {
  variant?: 'subtle' | 'accent' | 'bold';
  className?: string;
}) {
  const variants = {
    subtle: {
      type: 'blob' as OrganicShapeType,
      color: 'oklch(0.88 0.03 65)', // Lily Primary
      opacity: 0.05,
      width: 300,
      height: 300,
    },
    accent: {
      type: 'wave' as OrganicShapeType,
      color: 'oklch(0.64 0.02 130)', // Meadow
      opacity: 0.1,
      width: 400,
      height: 200,
    },
    bold: {
      type: 'cloud' as OrganicShapeType,
      color: 'oklch(0.20 0.01 180)', // Forest Primary
      opacity: 0.15,
      width: 500,
      height: 300,
    },
  };

  const config = variants[variant];

  return (
    <OrganicShape
      type={config.type}
      color={config.color}
      opacity={config.opacity}
      width={config.width}
      height={config.height}
      className={className}
    />
  );
}
