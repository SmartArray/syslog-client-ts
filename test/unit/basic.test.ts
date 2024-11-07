/* eslint-disable jest/no-done-callback */

/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import dgram from 'node:dgram';
import net from 'node:net';
import { EventEmitter } from 'node:events';

import Debug from 'debug';
const debug = Debug('test:unit');

import {
  Facility,
  IIdentity,
  Severity,
  SyslogClient,
} from '../../src/index.js';

const DEFAULT_IDENTITY: IIdentity = {
  facility: Facility.LOCAL0,
  severity: Severity.INFORMATIONAL,
  appName: 'TestApp',
  syslogHostname: 'test-host',
};

const UDP_PORT = 41234;
const TCP_PORT = 41235;

describe('SyslogClient', () => {
  it('should allow construction of the SyslogClient class', () => {
    const client = new SyslogClient(
      {
        hostname: 'localhost',
        port: 514,
        transport: 'udp',
      },
      DEFAULT_IDENTITY,
    );

    expect(typeof client === 'object').toBe(true);
  });

  describe('UDP Connection', () => {
    let server: dgram.Socket;
    const port = UDP_PORT;

    beforeAll(done => {
      server = dgram.createSocket('udp4');

      server.on('error', err => {
        debug(`Server error:\n${err.stack}`);
        server.close();
      });

      server.on('listening', () => {
        const address = server.address();
        debug(`Server listening ${address.address}:${address.port}`);
        done();
      });

      server.bind(port);
    });

    afterAll(done => {
      server.close();
      done();
    });

    it('should allow udp message transmission', done => {
      const client = new SyslogClient(
        {
          hostname: '127.0.0.1',
          port: UDP_PORT,
          transport: 'udp',
        },
        DEFAULT_IDENTITY,
      );

      server.once('message', (msg, rinfo) => {
        debug(
          `Server got: ${msg.toString()} from ${rinfo.address}:${rinfo.port}`,
        );

        expect(msg.toString()).toContain('Hello UDP');

        client.disconnect();

        done();
      });

      client
        .connect()
        .then(async () => {
          await client.log('Hello UDP');
        })
        .catch(e => {
          console.error(e);
        });
    });
  });

  describe('TCP Connection', () => {
    let server: net.Server;
    const port = TCP_PORT;

    const bridge = new EventEmitter();

    beforeAll(done => {
      server = net.createServer(socket => {
        socket.on('data', data => {
          debug('Data received from client:', data.toString());
          bridge.emit('message', data.toString(), socket);
        });
      });

      server.on('error', err => {
        debug(`Server error:\n${err.stack}`);
        server.close();
      });

      server.listen(port, () => {
        debug(`Server listening on port ${port}`);
        done();
      });
    });

    afterAll(done => {
      server.close();
      done();
    });

    it('should allow tcp message transmission', done => {
      const client = new SyslogClient(
        {
          hostname: '127.0.0.1',
          port: TCP_PORT,
          transport: 'tcp',
        },
        DEFAULT_IDENTITY,
      );

      bridge.once('message', (msg: string, rinfo: net.AddressInfo) => {
        debug(`Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        expect(msg.toString()).toContain('Hello TCP');

        client.disconnect();

        done();
      });

      client
        .connect()
        .then(async () => {
          await client.log('Hello TCP');
        })
        .catch(e => {
          console.error(e);
        });
    });
  });
});
