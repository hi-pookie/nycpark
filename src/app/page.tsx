"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { PARKS_MAP } from "@/lib/constants";
import { FIELD_TYPES } from "@/lib/fieldTypes";
import type { BookedSlot } from "@/lib/types";

const AvailabilityCalendar = dynamic(
  () => import("@/components/AvailabilityCalendar"),
  { ssr: false }
);

interface ParkResult {
  parkId: string;
  parkName: string;
  slots: BookedSlot[];
  error?: string;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function offsetDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const BOROUGHS = [
  { code: "M", label: "Manhattan" },
  { code: "B", label: "Brooklyn" },
  { code: "Q", label: "Queens" },
  { code: "X", label: "Bronx" },
  { code: "R", label: "Staten Island" },
];

export default function Home() {
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(offsetDateStr(7));
  const [fieldType, setFieldType] = useState<string>("Basketball");
  const [borough, setBorough] = useState<string>("M");
  const [parkData, setParkData] = useState<ParkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allParkIds = useMemo(() => Object.keys(PARKS_MAP), []);

  const parkIdsForBorough = useMemo(
    () => allParkIds.filter((id) => id[0] === borough),
    [allParkIds, borough]
  );

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    setLoadProgress(0);
    setSearched(false);
    setParkData([]);

    try {
      const BATCH = 20;
      const results: ParkResult[] = [];

      for (let i = 0; i < parkIdsForBorough.length; i += BATCH) {
        const batch = parkIdsForBorough.slice(i, i + BATCH);
        const res = await fetch("/api/parks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parkIds: batch }),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = (await res.json()) as ParkResult[];
        results.push(...data);
        setLoadProgress(
          Math.round(((i + batch.length) / parkIdsForBorough.length) * 100)
        );
      }

      setParkData(results);
      setSearched(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, parkIdsForBorough]);

  // Auto-load on mount with defaults (Manhattan, Basketball, this week)
  useEffect(() => { handleSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const parsedStart = useMemo(
    () => (startDate ? new Date(startDate + "T00:00:00") : null),
    [startDate]
  );
  const parsedEnd = useMemo(
    () => (endDate ? new Date(endDate + "T00:00:00") : null),
    [endDate]
  );

  const daySpan = useMemo(() => {
    if (!parsedStart || !parsedEnd) return 0;
    return (
      Math.round(
        (parsedEnd.getTime() - parsedStart.getTime()) / 86400000
      ) + 1
    );
  }, [parsedStart, parsedEnd]);

  const isValid =
    startDate &&
    endDate &&
    parsedStart &&
    parsedEnd &&
    parsedStart <= parsedEnd &&
    daySpan <= 31;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">NYC Parks Field Availability</h1>
              <p className="text-xs text-gray-500">Live permit data · {allParkIds.length} parks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6">

        {/* Controls — all on one panel */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-5 mb-6 space-y-5">

          {/* Field type — primary filter, shown first */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">
              Field Type
            </label>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFieldType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    fieldType === type
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-gray-800 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Borough — second filter */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">
              Borough
            </label>
            <div className="flex flex-wrap gap-2">
              {BOROUGHS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setBorough(code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    borough === code
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-gray-800 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="self-center text-xs text-gray-600 ml-1">
                {parkIdsForBorough.length} parks
              </span>
            </div>
          </div>

          {/* Date range + search */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!isValid || loading}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? "Loading…" : "Search"}
            </button>
            {daySpan > 31 && (
              <p className="text-xs text-rose-400 self-center">Max 31 days</p>
            )}
          </div>

          {/* Progress bar */}
          {loading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Fetching {parkIdsForBorough.length} parks…</span>
                <span>{loadProgress}%</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 mb-6 text-rose-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Calendar */}
        {searched && parsedStart && parsedEnd && (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="text-lg font-semibold">{fieldType} Courts &amp; Fields</h2>
              <span className="text-sm text-gray-500">
                {BOROUGHS.find((b) => b.code === borough)?.label} ·{" "}
                {parsedStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {parsedEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <AvailabilityCalendar
              parkData={parkData}
              fieldType={fieldType}
              startDate={parsedStart}
              endDate={parsedEnd}
            />
          </div>
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <div className="text-center py-20 text-gray-700">
            <p className="text-base font-medium">Choose a field type, borough, and date range</p>
          </div>
        )}
      </main>
    </div>
  );
}
