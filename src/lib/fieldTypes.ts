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

// Match against the field name column (e.g. "Basketball-01", "Great Lawn-Softball-01")
// "Track" catches "Track and Field" field names
export function matchesFieldType(fieldName: string, fieldType: string): boolean {
  return fieldName.toLowerCase().includes(fieldType.toLowerCase());
}
