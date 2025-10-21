'use client';

import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  SUSTAINABLE_DEVELOPMENT_GOALS,
  type SustainableDevelopmentGoal,
  describeArc,
} from '@/lib/sdg';

interface UNSDGCircularChartProps {
  /**
   * Optional percentages keyed by SDG id (1-17). Values should be 0-100.
   */
  values?: Partial<Record<number, number>>;
  className?: string;
  /**
   * Center label text. Defaults to "Sustainable Development Goals".
   */
  centerLabel?: string;
}

interface HoverState {
  goal: SustainableDevelopmentGoal;
  value?: number;
  position: { x: number; y: number };
}

const SEGMENT_GAP_DEGREES = 2;
const OUTER_RADIUS = 180;
const INNER_RADIUS = 120;
const LABEL_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;
const CENTER = OUTER_RADIUS + 10;
const VIEWBOX_SIZE = CENTER * 2;

export default function UNSDGCircularChart({
  values,
  className,
  centerLabel = 'Sustainable\nDevelopment Goals',
}: UNSDGCircularChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<HoverState | null>(null);

  const segments = useMemo(() => {
    const sliceAngle = 360 / SUSTAINABLE_DEVELOPMENT_GOALS.length;

    return SUSTAINABLE_DEVELOPMENT_GOALS.map((goal, index) => {
      const startAngle = index * sliceAngle + SEGMENT_GAP_DEGREES / 2;
      const endAngle = (index + 1) * sliceAngle - SEGMENT_GAP_DEGREES / 2;
      const midAngle = (startAngle + endAngle) / 2;

      const radians = ((midAngle - 90) * Math.PI) / 180;
      const labelX = CENTER + LABEL_RADIUS * Math.cos(radians);
      const labelY = CENTER + LABEL_RADIUS * Math.sin(radians);

      const value = values?.[goal.id];

      return {
        goal,
        path: describeArc({
          cx: CENTER,
          cy: CENTER,
          innerRadius: INNER_RADIUS,
          outerRadius: OUTER_RADIUS,
          startAngle,
          endAngle,
        }),
        label: {
          x: labelX,
          y: labelY,
          rotation: midAngle,
        },
        value,
      };
    });
  }, [values]);

  const handleMouseMove = (
    goal: SustainableDevelopmentGoal,
    value: number | undefined,
    event: React.MouseEvent<SVGPathElement>,
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();

    const position = rect
      ? {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
      : { x: event.clientX, y: event.clientY };

    setHovered({ goal, value, position });
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative mx-auto flex items-center justify-center', className)}
      style={{ width: VIEWBOX_SIZE, height: VIEWBOX_SIZE }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="United Nations Sustainable Development Goals"
      >
        <title>United Nations Sustainable Development Goals</title>
        {segments.map(({ goal, path, label, value }) => {
          const isActive = hovered?.goal.id === goal.id;
          return (
            <g key={goal.id}>
              <path
                d={path}
                fill={goal.color}
                className={cn(
                  'cursor-pointer transition-all duration-300 ease-out [transform-box:fill-box] [transform-origin:center]',
                  isActive && 'drop-shadow-[0_0_12px_rgba(0,0,0,0.25)]',
                )}
                style={{
                  transform: `scale(${isActive ? 1.05 : 1})`,
                  filter: isActive ? 'brightness(1.1)' : 'none',
                }}
                onMouseEnter={(event) => handleMouseMove(goal, value, event)}
                onMouseMove={(event) => handleMouseMove(goal, value, event)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none text-xs font-bold tracking-tight fill-white"
              >
                {goal.id}
              </text>
              {typeof value === 'number' && (
                <text
                  x={label.x}
                  y={label.y + 16}
                  textAnchor="middle"
                  className="select-none text-[10px] font-semibold fill-white/90"
                >
                  {Math.round(value)}%
                </text>
              )}
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 24} fill="#f8fafc" />
        {centerLabel.split('\n').map((line, index, array) => (
          <text
            key={line}
            x={CENTER}
            y={CENTER + (index - (array.length - 1) / 2) * 20}
            textAnchor="middle"
            className={cn(
              'fill-slate-600 text-[16px] font-semibold tracking-tight',
              index === 0 && 'font-bold text-[18px]',
            )}
          >
            {line}
          </text>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[180px] rounded-lg border bg-white p-3 text-xs shadow-lg"
          style={{
            left: hovered.position.x + 12,
            top: hovered.position.y + 12,
          }}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            Goal {hovered.goal.id}
          </p>
          <p className="text-sm font-medium text-slate-900">{hovered.goal.title}</p>
          {typeof hovered.value === 'number' && (
            <p className="mt-1 text-xs text-slate-500">Contribution: {hovered.value}%</p>
          )}
        </div>
      )}
    </div>
  );
}
