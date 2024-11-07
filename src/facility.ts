// Facility constants.
// Taken from page 10 in https://datatracker.ietf.org/doc/html/rfc5424

export const Facility = {
  KERNEL: 0,
  USER: 1,
  MAIL: 2,
  SYSTEM: 3,
  DAEMON: 3,
  AUTH: 4,
  SYSLOG: 5,
  LPR: 6,
  NEWS: 7,
  UUCP: 8,
  CRON: 9,
  AUTHPRIV: 10,
  FTP: 11,
  AUDIT: 13,
  ALERT: 14,
  LOCAL0: 16,
  LOCAL1: 17,
  LOCAL2: 18,
  LOCAL3: 19,
  LOCAL4: 20,
  LOCAL5: 21,
  LOCAL6: 22,
  LOCAL7: 23
} as const;

export type FacilityType = (typeof Facility)[keyof typeof Facility];
