export interface BookedSlot {
  /** YYYY-MM-DD in local (Eastern) time */
  dateKey: string;
  /** Minutes since midnight for start time */
  startMinutes: number;
  /** Minutes since midnight for end time */
  endMinutes: number;
  field: string;
  sport: string;
  eventName: string;
  organization: string;
  status: string;
}

export interface ParkData {
  parkId: string;
  parkName: string;
  slots: BookedSlot[];
  error?: string;
}

export interface FieldAvailability {
  parkId: string;
  parkName: string;
  fieldName: string;
  days: Record<string, DayAvailability>;
}

export interface DayAvailability {
  bookedSlots: { startMinutes: number; endMinutes: number; label: string }[];
  fullyBooked: boolean;
}
