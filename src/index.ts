import { SyslogClient } from './client.js';
import { Facility, FacilityType } from './facility.js';
import { Severity, SeverityType } from './severity.js';
import { IIdentity } from './identity.js';
import { ITCPOptions } from './tcp.js';
import { ISyslogClientOptions } from './clientOptions.js';

// Export classes
export { SyslogClient, Facility, Severity };

// Export interfaces
export { ISyslogClientOptions, IIdentity, ITCPOptions };

// Export types
export { FacilityType, SeverityType };
