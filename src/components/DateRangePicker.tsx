import React, { useMemo, useState } from 'react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function isSameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [cursor, setCursor] = useState<Date>(value.start ?? new Date());

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const startWeekday = (first.getDay() + 6) % 7; // week starts Mon
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const inRange = (d: Date) => {
    const { start, end } = value;
    if (!start || !end) return false;
    const t = d.setHours(0,0,0,0);
    return t >= start.setHours(0,0,0,0) && t <= end.setHours(0,0,0,0);
  };

  const pick = (d: Date) => {
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: d, end: null });
    } else if (start && !end) {
      if (d < start) onChange({ start: d, end: start });
      else onChange({ start, end: d });
    }
  };

  const fmt = (d: Date | null) => d ? d.toLocaleDateString() : '—';

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCursor(addMonths(cursor, -1))} className="text-zinc-300 hover:text-white">←</button>
        <div className="text-white font-semibold">
          {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => setCursor(addMonths(cursor, 1))} className="text-zinc-300 hover:text-white">→</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-zinc-400 mb-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => d ? (
          <button
            key={i}
            onClick={() => pick(d)}
            className={`py-2 rounded text-sm border transition-colors ${
              (value.start && isSameDay(d, value.start)) || (value.end && isSameDay(d, value.end))
                ? 'bg-cyan-500 text-black border-cyan-500'
                : inRange(d)
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'text-white/90 border-zinc-700 hover:border-zinc-600'
            }`}
          >
            {d.getDate()}
          </button>
        ) : <div key={i} />)}
      </div>

      <div className="mt-3 text-xs text-zinc-400 flex items-center justify-between">
        <span>Start: <span className="text-white">{fmt(value.start)}</span></span>
        <span>End: <span className="text-white">{fmt(value.end)}</span></span>
      </div>
    </div>
  );
}

