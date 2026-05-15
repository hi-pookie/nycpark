import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/parseCSV";
import { PARKS_MAP } from "@/lib/constants";

const NYC_PARKS_CSV_URL =
  "https://www.nycgovparks.org/permits/field-and-court/issued";

async function fetchParkCSV(parkId: string): Promise<string> {
  const url = `${NYC_PARKS_CSV_URL}/${parkId}/csv`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.nycgovparks.org/permits/field-and-court/map",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for park ${parkId}`);
  return res.text();
}

export async function POST(request: NextRequest) {
  try {
    const { parkIds } = (await request.json()) as { parkIds: string[] };

    if (!parkIds || !Array.isArray(parkIds) || parkIds.length === 0) {
      return NextResponse.json(
        { error: "parkIds array required" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      parkIds.map(async (parkId) => {
        const text = await fetchParkCSV(parkId);
        const slots = parseCSV(text);
        return {
          parkId,
          parkName: PARKS_MAP[parkId] ?? parkId,
          slots, // already plain objects — no Date instances
        };
      })
    );

    const data = results.map((result, i) => {
      const parkId = parkIds[i];
      if (result.status === "fulfilled") return result.value;
      return {
        parkId,
        parkName: PARKS_MAP[parkId] ?? parkId,
        slots: [],
        error: String(result.reason),
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
