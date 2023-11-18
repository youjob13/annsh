export type DateTimes = {
  nonAvailableDates: Record<string, number[]>;
  availableDates: Record<string, number[]>;
};

export enum DateType {
  NON_AVAILABLE = "nonAvailable",
  AVAILABLE = "available",
}

export enum AvailabilityStatus {
  IS_AVAILABLE = "isAvailable",
  IS_NON_AVAILABLE = "isNonAvailable",
}
