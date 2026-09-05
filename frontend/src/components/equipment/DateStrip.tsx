"use client";

import { useMemo, useRef } from "react";

export type BookedRange = { start: string; end: string };

type DateStripProps = {
  /** Currently selected date, formatted as YYYY-MM-DD, or empty string */
  value: string;
  onChange: (date: string) => void;
  /** Earliest selectable date, formatted as YYYY-MM-DD */
  minDate: string;
  /** How many days to show in the strip */
  daysToShow?: number;
  bookedDates?: BookedRange[];
  /** Optional second date to visually highlight a start->end range */
  rangeEnd?: string;
};

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isWithinBookedRange(dateKey: string, bookedDates: BookedRange[]): boolean {
  return bookedDates.some((range) => dateKey >= range.start && dateKey <= range.end);
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function DateStrip({
  value,
  onChange,
  minDate,
  daysToShow = 30,
  bookedDates = [],
  rangeEnd,
}: DateStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const start = new Date(`${minDate}T00:00:00`);
    return Array.from({ length: daysToShow }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [minDate, daysToShow]);

  return (
    <div
      ref={scrollerRef}
      className="flex gap-2 overflow-x-auto pb-1"
      role="listbox"
      aria-label="Select a date"
    >
      {days.map((d) => {
        const dateKey = toDateKey(d);
        const booked = isWithinBookedRange(dateKey, bookedDates);
        const isSelected = dateKey === value;
        const isInRange =
          rangeEnd && value && dateKey > value && dateKey <= rangeEnd;

        return (
          <button
            key={dateKey}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={booked}
            onClick={() => onChange(dateKey)}
            className={`flex w-14 flex-shrink-0 flex-col items-center rounded-xl border px-1 py-2 text-xs transition ${
              booked
                ? "cursor-not-allowed border-forest/5 bg-forest/5 text-muted/50 line-through"
                : isSelected
                ? "border-leaf bg-leaf text-forest-deep font-bold"
                : isInRange
                ? "border-leaf/40 bg-leaf/15 text-forest"
                : "border-forest/15 bg-white text-forest hover:border-leaf/40"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-70">
              {WEEKDAY_LABELS[d.getDay()]}
            </span>
            <span className="mt-0.5 text-base font-bold">{d.getDate()}</span>
            <span className="text-[10px] opacity-70">{MONTH_LABELS[d.getMonth()]}</span>
            {booked && <span className="mt-0.5 text-[9px] font-semibold">Booked</span>}
          </button>
        );
      })}
    </div>
  );
}
