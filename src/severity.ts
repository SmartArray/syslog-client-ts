// Severity constants
// Taken from page 11 in https://datatracker.ietf.org/doc/html/rfc5424

export const Severity = {
  EMERGENCY: 0,
  ALERT: 1,
  CRITICAL: 2,
  ERROR: 3,
  WARNING: 4,
  NOTICE: 5,
  INFORMATIONAL: 6,
  DEBUG: 7,
} as const;

export type SeverityType = (typeof Severity)[keyof typeof Severity];
