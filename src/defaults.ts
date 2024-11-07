import os from 'node:os';

import { Facility } from './facility.js';
import { Severity } from './severity.js';
import { ISyslogClientOptions } from './clientOptions.js';
import { IIdentity } from './identity.js';
import { ITCPOptions } from './tcp.js';

export const DEFAULT_SYSLOG_PORT = 514;

export const DEFAULT_SYSLOG_TRANSPORT = 'tcp';

export const DEFAULT_SYSLOG_CLIENT_OPTIONS = (): ISyslogClientOptions => ({
  hostname: '127.0.0.1',
  port: DEFAULT_SYSLOG_PORT,
  transport: DEFAULT_SYSLOG_TRANSPORT
});

export const DEFAULT_IDENTITY = (): IIdentity => ({
  facility: Facility.USER,
  severity: Severity.INFORMATIONAL,
  appName: process.title,
  syslogHostname: os.hostname(),
  pid: process.pid
});

export const DEFAULT_TCP_OPTIONS = (): ITCPOptions => ({
  timeout: 5000,
  reconnect: false,
  reconnectInterval: 3000
});
