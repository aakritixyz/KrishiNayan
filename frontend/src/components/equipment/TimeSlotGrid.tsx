"use client";

export type TimeSlotGroup = { label: string; slots: string[] };

const DEFAULT_GROUPS: TimeSlotGroup[] = [
  { label: "Morning", slots: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"] },
  { label: "Afternoon", slots: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  { label: "Evening", slots: ["5:00 PM", "6:00 PM"] },
];

type TimeSlotGridProps = {
  value: string;
  onChange: (slot: string) => void;
  groups?: TimeSlotGroup[];
  /** Slots that can't be selected, e.g. already booked for the chosen date */
  disabledSlots?: string[];
};

export default function TimeSlotGrid({
  value,
  onChange,
  groups = DEFAULT_GROUPS,
  disabledSlots = [],
}: TimeSlotGridProps) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
            {group.label}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {group.slots.map((slot) => {
              const isSelected = slot === value;
              const isDisabled = disabledSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onChange(slot)}
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    isDisabled
                      ? "cursor-not-allowed border-forest/5 bg-forest/5 text-muted/50 line-through"
                      : isSelected
                      ? "border-leaf bg-leaf text-forest-deep"
                      : "border-forest/15 bg-white text-forest hover:border-leaf/40"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
