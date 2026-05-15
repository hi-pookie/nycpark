import type { BookedSlot } from "./types";

interface ParsedDateTime {
  dateKey: string; // YYYY-MM-DD
  minutes: number; // minutes since midnight
}

// Parse "3/17/2026 3:00 p.m." → { dateKey: "2026-03-17", minutes: 900 }
// CRITICAL: use \d{1,2} for month/day — single-digit months like 3/17/2026 are common.
// Using \d{2} means NO dates ever match = all cells green.
function parseNYCDateTime(str: string): ParsedDateTime | null {
  const dateMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return null;

  const month = parseInt(dateMatch[1], 10);
  const day = parseInt(dateMatch[2], 10);
  const year = parseInt(dateMatch[3], 10);

  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const timeMatch = str.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);
  let hours = 0;
  let mins = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    mins = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3].toLowerCase().replace(/\./g, "");
    if (meridiem === "pm" && hours !== 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  return { dateKey, minutes: hours * 60 + mins };
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCSV(text: string): BookedSlot[] {
  if (
    text.includes("There is no field usage information") ||
    text.trim() === ""
  ) {
    return [];
  }

  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1); // skip header
  const slots: BookedSlot[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;
    const fields = parseCSVLine(line);
    if (fields.length < 7) continue;

    const [startStr, endStr, fieldName, sportRaw, eventName, org, status] =
      fields;

    const start = parseNYCDateTime(startStr);
    const end = parseNYCDateTime(endStr);
    if (!start || !end) continue;

    slots.push({
      dateKey: start.dateKey,
      startMinutes: start.minutes,
      endMinutes: end.minutes,
      field: fieldName,
      sport: sportRaw.trim(), // CSV has a leading space — always trim
      eventName,
      organization: org,
      status,
    });
  }

  return slots;
}

export function extractSports(slots: BookedSlot[]): string[] {
  const sports = new Set<string>();
  for (const slot of slots) {
    if (slot.sport) sports.add(slot.sport);
  }
  return Array.from(sports).sort();
}

export function dateRangeDays(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = cur.getMonth() + 1;
    const d = cur.getDate();
    days.push(
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${m > 0 ? `:${String(m).padStart(2, "0")}` : ""} ${ampm}`;
}
