import { FacilityType } from './facility.js';
import { SeverityType } from './severity.js';

// Identity interface that defines several fields of each syslog message.
export interface IIdentity {
  facility: FacilityType;
  severity: SeverityType;
  appName?: string;
  syslogHostname?: string;
  pid?: number;
}
