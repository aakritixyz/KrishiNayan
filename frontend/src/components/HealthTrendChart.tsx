"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";

export type HealthTrendPoint = {
  date: string;
  score: number;
  disease: string;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 140;
const PADDING_X = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;

function scoreColor(score: number): string {
  if (score >= 70) return "#063b2a"; // forest
  if (score >= 40) return "#f5a800"; // warning
  return "#d83a32"; // danger
}

export default function HealthTrendChart({
  points,
}: {
  points: HealthTrendPoint[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(
    points.length > 0 ? points.length - 1 : null
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

  const plotWidth = CHART_WIDTH - PADDING_X * 2;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const coordinates = useMemo(() => {
    if (points.length === 0) return [];

    return points.map((point, index) => {
      const x =
        points.length === 1
          ? PADDING_X + plotWidth / 2
          : PADDING_X + (index / (points.length - 1)) * plotWidth;

      const y =
        PADDING_TOP + plotHeight - (point.score / 100) * plotHeight;

      return { x, y, ...point };
    });
  }, [points, plotWidth, plotHeight]);

  const pathData = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaData =
    coordinates.length > 0
      ? `${pathData} L ${coordinates[coordinates.length - 1].x} ${
          PADDING_TOP + plotHeight
        } L ${coordinates[0].x} ${PADDING_TOP + plotHeight} Z`
      : "";

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!svgRef.current || coordinates.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const relativeX =
      ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    coordinates.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  }

  if (points.length === 0) {
    return null;
  }

  const active = activeIndex !== null ? coordinates[activeIndex] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={() =>
          setActiveIndex(coordinates.length - 1)
        }
      >
        {/* Reference lines at 0/50/100 */}
        {[0, 50, 100].map((mark) => {
          const y = PADDING_TOP + plotHeight - (mark / 100) * plotHeight;

          return (
            <line
              key={mark}
              x1={PADDING_X}
              x2={CHART_WIDTH - PADDING_X}
              y1={y}
              y2={y}
              stroke="#e5eadf"
              strokeWidth={1}
            />
          );
        })}

        {areaData && (
          <path d={areaData} fill="#b7e300" fillOpacity={0.12} />
        )}

        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="#84bd00"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coordinates.map((point, index) => (
          <circle
            key={point.date + index}
            cx={point.x}
            cy={point.y}
            r={index === activeIndex ? 5 : 3}
            fill={scoreColor(point.score)}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PADDING_TOP}
            y2={PADDING_TOP + plotHeight}
            stroke="#063b2a"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        )}

        {/* x-axis date labels: first and last only, to stay legible */}
        {coordinates.length > 0 && (
          <>
            <text
              x={coordinates[0].x}
              y={CHART_HEIGHT - 6}
              fontSize={9}
              fill="#66756d"
              textAnchor="start"
            >
              {formatShortDate(coordinates[0].date)}
            </text>
            <text
              x={coordinates[coordinates.length - 1].x}
              y={CHART_HEIGHT - 6}
              fontSize={9}
              fill="#66756d"
              textAnchor="end"
            >
              {formatShortDate(coordinates[coordinates.length - 1].date)}
            </text>
          </>
        )}
      </svg>

      {active && (
        <div className="mt-1 flex items-center justify-between rounded-xl bg-forest/5 px-3 py-2 text-xs">
          <span className="font-semibold text-forest">
            {formatFullDate(active.date)}
          </span>
          <span className="text-muted">{active.disease}</span>
          <span
            className="font-bold"
            style={{ color: scoreColor(active.score) }}
          >
            {Math.round(active.score)}/100
          </span>
        </div>
      )}
    </div>
  );
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
