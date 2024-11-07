// test_syslog_client.spec.ts

import {
  Facility,
  Severity,
  SyslogClient,
  IIdentity,
} from '../../src/index.js';

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert';

jest.setTimeout(10000); // Extend timeout for container startup

const logFilePath = path.join(__dirname, 'logs', 'syslog_test.log');

const createIdentity = (overrideOptions?: object): IIdentity =>
  Object.assign(
    {
      facility: Facility.LOCAL0,
      severity: Severity.INFORMATIONAL,
      appName: 'TestApp',
      syslogHostname: 'test-host',
    },
    overrideOptions,
  );

// Caller need to make sure every message is unique or delete the logfilea fter each test
async function logAndCheck(
  client: SyslogClient,
  message: string,
  identity?: Partial<IIdentity>,
): Promise<string> {
  await client.log(message, identity);

  // Wait for rsyslog to process the message
  await new Promise<void>(resolve => setTimeout(resolve, 500));

  // Read the log file
  const logs = fs.readFileSync(logFilePath, 'utf8');

  const lines = logs.split(/\n/);

  function check(line: string): boolean {
    if (!line.includes(message)) return false;

    if (typeof identity?.appName === 'string') {
      if (!line.includes(identity.appName)) return false;
    }

    if (typeof identity?.syslogHostname === 'string') {
      if (!line.includes(identity.syslogHostname)) return false;
    }

    return true;
  }

  const line = lines.find(l => check(l));

  if (!line) {
    assert.ok(!!line, `Message '${message}' not found in rsyslog logs`);
  }

  return line;
}

describe('SyslogClient Integration Test', () => {
  beforeAll(() => {
    try {
      fs.unlinkSync(logFilePath);
    } catch (e) {
      void e;
    }
  });

  for (const leTransport of ['tcp', 'udp']) {
    const transport = leTransport as 'udp' | 'tcp';

    it(`should send and receive a syslog message using transport '${transport}'`, async () => {
      const identity: IIdentity = createIdentity();

      const client = new SyslogClient(
        {
          hostname: 'localhost',
          port: 514,
          transport: transport,
        },
        identity,
      );

      let message: string | undefined = undefined;

      try {
        await client.connect();
        message = await logAndCheck(
          client,
          `Test message using transport '${transport}'`,
        );
      } finally {
        client.disconnect();
      }

      expect(typeof message === 'string').toBe(true);
    });

    it(`should send and receive a syslog message using transport '${transport}' and a custom identity`, async () => {
      const identity: IIdentity = createIdentity();

      const client = new SyslogClient(
        {
          hostname: 'localhost',
          port: 514,
          transport: transport,
        },
        identity,
      );

      let message: string | undefined = undefined;

      try {
        await client.connect();
        message = await logAndCheck(
          client,
          `A test message with custom identity using transport '${transport}'`,
          {
            facility: Facility.AUDIT,
            severity: Severity.EMERGENCY,
            appName: 'secret-identity',
            syslogHostname: 'secret-host',
            pid: 1337,
          },
        );
      } finally {
        client.disconnect();
      }
      expect(message).toContain(' 1337 ');
    });
  }
});
