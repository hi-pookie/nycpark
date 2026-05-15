// Exact sport categories from the NYC Parks permit site dropdown
// Source: /permits/field-and-court/map sport-select element
export const FIELD_TYPES = [
  "Baseball",
  "Basketball",
  "Bocce",
  "Cricket",
  "Football",
  "Frisbee",
  "Handball",
  "Hockey",
  "Kickball",
  "Lacrosse",
  "Netball",
  "Rugby",
  "Soccer",
  "Softball",
  "Tennis",
  "Track",
  "Volleyball",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

// These sports have no dedicated named fields (e.g. no "Bocce-01" exists).
// They are permitted on multi-use fields. For these we match against the
// Sport column instead of the Field name column.
export const SPORT_COLUMN_TYPES = new Set([
  "Bocce",
  "Frisbee",
  "Hockey",
  "Kickball",
  "Lacrosse",
  "Netball",
  "Rugby",
]);

// Match against the field name column (e.g. "Basketball-01", "Great Lawn-Softball-01")
export function matchesFieldType(fieldName: string, fieldType: string): boolean {
  return fieldName.toLowerCase().includes(fieldType.toLowerCase());
}

// Match against the sport column (e.g. "Frisbee", "Lacrosse - Adult")
export function matchesSportColumn(sport: string, fieldType: string): boolean {
  return sport.toLowerCase().includes(fieldType.toLowerCase());
}
