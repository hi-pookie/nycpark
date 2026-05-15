"use client";

import { useMemo, useState } from "react";
import type { BookedSlot } from "@/lib/types";
import { dateRangeDays, formatMinutes } from "@/lib/parseCSV";
import { getBoroughFromId } from "@/lib/constants";
import { matchesFieldType } from "@/lib/fieldTypes";

interface Props {
  parkData: Array<{
    parkId: string;
    parkName: string;
    slots: BookedSlot[];
  }>;
  fieldType: string;
  startDate: Date;
  endDate: Date;
}

const DAY_START_MIN = 6 * 60;
const DAY_END_MIN = 23 * 60;
const DAY_SPAN = DAY_END_MIN - DAY_START_MIN;

function toPercent(minutes: number): number {
  const clamped = Math.max(DAY_START_MIN, Math.min(DAY_END_MIN, minutes));
  return ((clamped - DAY_START_MIN) / DAY_SPAN) * 100;
}

interface Segment {
  start: number;
  end: number;
  free: boolean;
  label: string;
}

function buildSegments(
  booked: Array<{ start: number; end: number; sport: string; org: string }>
): Segment[] {
  const sorted = [...booked].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = DAY_START_MIN;

  for (const slot of sorted) {
    const start = Math.max(slot.start, DAY_START_MIN);
    const end = Math.min(slot.end, DAY_END_MIN);
    if (start > cursor) {
      segments.push({
        start: cursor,
        end: start,
        free: true,
        label: `Available\n${formatMinutes(cursor)} – ${formatMinutes(start)}`,
      });
    }
    if (end > start) {
      segments.push({
        start,
        end,
        free: false,
        label: `${formatMinutes(start)} – ${formatMinutes(end)}\n${slot.sport}${slot.org ? `\n${slot.org}` : ""}`,
      });
    }
    cursor = Math.max(cursor, end);
  }

  if (cursor < DAY_END_MIN) {
    segments.push({
      start: cursor,
      end: DAY_END_MIN,
      free: true,
      label: `Available\n${formatMinutes(cursor)} – ${formatMinutes(DAY_END_MIN)}`,
    });
  }

  return segments;
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

const HOUR_TICKS = [6, 9, 12, 15, 18, 21];

export default function AvailabilityCalendar({
  parkData,
  fieldType,
  startDate,
  endDate,
}: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const days = useMemo(
    () => dateRangeDays(startDate, endDate),
    [startDate, endDate]
  );

  // Build fieldMap keyed by "parkId|fieldName"
  // Filter by field name (not sport) — Basketball-01 is always a basketball court
  // Show ALL bookings on matching fields regardless of what sport was booked
  const fieldMap = useMemo(() => {
    type Entry = {
      parkId: string;
      parkName: string;
      fieldName: string;
      days: Record<
        string,
        Array<{ start: number; end: number; sport: string; org: string }>
      >;
    };
    const map = new Map<string, Entry>();

    for (const park of parkData) {
      for (const slot of park.slots) {
        if (!matchesFieldType(slot.field, fieldType)) continue;

        const key = `${park.parkId}|${slot.field}`;
        if (!map.has(key)) {
          map.set(key, {
            parkId: park.parkId,
            parkName: park.parkName,
            fieldName: slot.field,
            days: {},
          });
        }
        const entry = map.get(key)!;
        if (!entry.days[slot.dateKey]) entry.days[slot.dateKey] = [];
        entry.days[slot.dateKey].push({
          start: slot.startMinutes,
          end: slot.endMinutes,
          sport: slot.sport,
          org: slot.organization || slot.eventName,
        });
      }
    }

    return map;
  }, [parkData, fieldType]);

  const fields = useMemo(() => {
    const list = Array.from(fieldMap.values());
    list.sort((a, b) => {
      if (a.parkId[0] !== b.parkId[0]) return a.parkId[0].localeCompare(b.parkId[0]);
      if (a.parkName !== b.parkName) return a.parkName.localeCompare(b.parkName);
      return a.fieldName.localeCompare(b.fieldName);
    });
    return list;
  }, [fieldMap]);

  if (fields.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-base">No <strong className="text-gray-300">{fieldType}</strong> fields found in this data.</p>
        <p className="text-sm mt-1 text-gray-600">Try a different borough or widen the date range.</p>
      </div>
    );
  }

  function handleEnter(e: React.MouseEvent, text: string) {
    const table = (e.currentTarget as HTMLElement).closest("table");
    if (!table) return;
    const rect = table.getBoundingClientRect();
    setTooltip({ text, x: e.clientX - rect.left + 10, y: e.clientY - rect.top - 10 });
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(16,185,129,0.20)", border: "1px solid rgba(16,185,129,0.35)" }} />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(244,63,94,0.65)", border: "1px solid rgba(244,63,94,0.85)" }} />
          <span>Booked</span>
        </div>
        <span className="text-gray-700">6 AM – 11 PM · hover for times</span>
        <span className="ml-auto text-gray-600">{fields.length} {fieldType.toLowerCase()} field{fields.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 pr-4 font-medium text-gray-400 sticky left-0 bg-gray-900 z-10 min-w-[200px]">
                Field
              </th>
              {days.map((dateKey) => {
                const d = new Date(dateKey + "T12:00:00");
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={dateKey}
                    className={`py-3 px-2 text-center font-medium min-w-[90px] ${isWeekend ? "text-emerald-400" : "text-gray-300"}`}
                  >
                    <div className="text-xs uppercase tracking-wide leading-none mb-1 opacity-60">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-sm leading-none">
                      {d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => {
              const prevBorough = idx > 0 ? fields[idx - 1].parkId[0] : null;
              const showBoroughHeader = field.parkId[0] !== prevBorough;

              return (
                <tr key={`${field.parkId}|${field.fieldName}`}>
                  {showBoroughHeader && (
                    // Borough divider rendered as first cell content via a preceding row
                    // handled below — this tr is the data row
                    null
                  )}
                </tr>
              );
            })}
            {fields.map((field, idx) => {
              const prevBorough = idx > 0 ? fields[idx - 1].parkId[0] : null;
              const showBoroughHeader = field.parkId[0] !== prevBorough;

              return (
                <>
                  {showBoroughHeader && (
                    <tr key={`bh-${field.parkId[0]}-${idx}`}>
                      <td
                        colSpan={days.length + 1}
                        className="pt-5 pb-1 text-xs font-semibold text-gray-600 uppercase tracking-widest sticky left-0 bg-gray-900"
                      >
                        {getBoroughFromId(field.parkId)}
                      </td>
                    </tr>
                  )}
                  <tr
                    key={`${field.parkId}|${field.fieldName}`}
                    className="border-b border-white/5 hover:bg-white/[0.02] group"
                  >
                    <td className="py-2 pr-4 sticky left-0 bg-gray-900 group-hover:bg-gray-800/60 z-10 align-middle transition-colors">
                      <div className="text-gray-200 font-medium text-xs leading-tight">{field.fieldName}</div>
                      <div className="text-xs text-gray-600 mt-0.5 leading-tight">{field.parkName}</div>
                    </td>
                    {days.map((dateKey) => {
                      const booked = field.days[dateKey] ?? [];
                      const segments = buildSegments(booked);
                      const fullyFree = booked.length === 0;
                      const fullyBooked =
                        !fullyFree &&
                        segments.every((s) => !s.free);

                      return (
                        <td key={dateKey} className="py-2 px-2 align-middle">
                          <div
                            className="relative h-7 rounded overflow-hidden"
                            style={{
                              background: fullyBooked
                                ? "rgba(244,63,94,0.15)"
                                : "rgba(16,185,129,0.15)",
                              border: fullyBooked
                                ? "1px solid rgba(244,63,94,0.25)"
                                : "1px solid rgba(16,185,129,0.25)",
                            }}
                          >
                            {HOUR_TICKS.map((h) => (
                              <div
                                key={h}
                                className="absolute top-0 bottom-0 w-px bg-white/5"
                                style={{ left: `${toPercent(h * 60)}%` }}
                              />
                            ))}
                            {segments.map((seg, i) => {
                              const left = toPercent(seg.start);
                              const width = Math.max(toPercent(seg.end) - left, 1);
                              return (
                                <div
                                  key={i}
                                  className="absolute top-0 bottom-0 cursor-default"
                                  style={{
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    background: seg.free ? "transparent" : "rgba(244,63,94,0.65)",
                                    borderLeft: seg.free ? "none" : "1px solid rgba(244,63,94,0.9)",
                                    borderRight: seg.free ? "none" : "1px solid rgba(244,63,94,0.9)",
                                  }}
                                  onMouseEnter={(e) => handleEnter(e, seg.label)}
                                  onMouseLeave={() => setTooltip(null)}
                                />
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-gray-800 border border-white/20 rounded px-3 py-2 text-xs text-gray-100 whitespace-pre shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y, maxWidth: 240 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
