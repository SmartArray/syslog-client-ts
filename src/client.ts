import net from 'node:net';
import dgram from 'node:dgram';
import { EventEmitter } from 'node:events';

import { ISyslogClientOptions } from './clientOptions.js';
import { IIdentity } from './identity.js';
import { ITCPOptions } from './tcp.js';

import {
  DEFAULT_SYSLOG_PORT,
  DEFAULT_SYSLOG_TRANSPORT,
  DEFAULT_SYSLOG_CLIENT_OPTIONS,
  DEFAULT_IDENTITY,
  DEFAULT_TCP_OPTIONS,
} from './defaults.js';

export class SyslogClient extends EventEmitter {
  private options: ISyslogClientOptions;
  private identity: IIdentity;
  private tcpOptions: ITCPOptions;

  private socket: net.Socket | dgram.Socket | null;
  private isReconnecting: boolean;
  private isConnected: boolean;

  constructor(
    options: ISyslogClientOptions,
    defaultIdentity?: IIdentity,
    tcpOptions?: ITCPOptions,
  ) {
    super();

    this.options = Object.assign(DEFAULT_SYSLOG_CLIENT_OPTIONS(), options);
    this.identity = Object.assign(DEFAULT_IDENTITY(), defaultIdentity);
    this.tcpOptions = Object.assign(DEFAULT_TCP_OPTIONS(), tcpOptions);

    this.socket = null;
    this.isConnected = false;
    this.isReconnecting = false;
  }

  async connect(): Promise<void> {
    if ((this.options.transport ?? DEFAULT_SYSLOG_TRANSPORT) === 'tcp') {
      return this.connectTCP();
    } else {
      return this.connectUDP();
    }
  }

  private async connectTCP(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      const connectHandler = (): void => {
        this.socket = socket;
        this.isConnected = true;
        this.emit('connect');
        resolve();
      };

      const errorHandler = (err: Error): void => {
        this.emit('error', err);
        if (this.tcpOptions?.reconnect && !this.isReconnecting) {
          this.isReconnecting = true;
          setTimeout(() => {
            this.isReconnecting = false;
            this.connectTCP().catch(() => {});
          }, this.tcpOptions?.reconnectInterval ?? 1000);
        } else {
          reject(err);
        }
      };

      const closeHandler = (): void => {
        this.isConnected = false;
        this.emit('disconnect');
        if (this.tcpOptions?.reconnect && !this.isReconnecting) {
          this.isReconnecting = true;
          setTimeout(() => {
            this.isReconnecting = false;
            this.connectTCP().catch(() => {});
          }, this.tcpOptions?.reconnectInterval ?? 1000);
        }
      };

      socket.connect(
        this.options.port ?? DEFAULT_SYSLOG_PORT,
        this.options.hostname,
        connectHandler,
      );

      socket.on('error', errorHandler);

      socket.on('close', closeHandler);

      if (this.tcpOptions?.timeout) {
        socket.setTimeout(this.tcpOptions.timeout);
        socket.on('timeout', () => {
          this.emit('error', new Error('Socket timeout'));
          socket.destroy();
        });
      }
    });
  }

  private async connectUDP(): Promise<void> {
    return new Promise(resolve => {
      const socket = dgram.createSocket('udp4');

      socket.on('error', err => {
        this.emit('error', err);
      });

      this.socket = socket;
      this.isConnected = true;
      this.emit('connect');

      resolve();
    });
  }

  async log(
    message: string,
    overrideIdentity: Partial<IIdentity> = {},
  ): Promise<void> {
    const msg = this._prepareMessage(message, overrideIdentity);
    await this._send(msg);
  }

  private _prepareMessage(
    message: string,
    overrideIdentity: Partial<IIdentity> = {},
  ): string {
    const computedIdentity = Object.assign({}, this.identity, overrideIdentity);

    const { facility, severity, appName, syslogHostname, pid } =
      computedIdentity;

    const pri = facility * 8 + severity;
    const timestamp = new Date().toISOString();
    const hostname = syslogHostname;
    const procId = pid ?? process.pid;
    const msgId = '-';
    const structuredData = '-';

    const syslogMessage = `<${pri}>1 ${timestamp} ${hostname} ${appName} ${procId} ${msgId} ${structuredData} ${message}`;

    return syslogMessage;
  }

  private async _send(message: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    if ((this.options.transport ?? DEFAULT_SYSLOG_TRANSPORT) === 'tcp') {
      const socket = this.socket as net.Socket;
      return new Promise((resolve, reject) => {
        socket.write(message + '\n', 'utf8', err => {
          if (err) {
            this.emit('error', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else {
      // Send message as UDP
      const socket = this.socket as dgram.Socket;

      return new Promise((resolve, reject) => {
        const messageBuffer = Buffer.from(message);

        socket.send(
          messageBuffer,
          0,
          messageBuffer.length,
          this.options.port ?? DEFAULT_SYSLOG_PORT,
          this.options.hostname,
          err => {
            if (err) {
              this.emit('error', err);
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      if ((this.options.transport ?? DEFAULT_SYSLOG_TRANSPORT) === 'tcp') {
        (this.socket as net.Socket).end();
      } else {
        (this.socket as dgram.Socket).close();
      }
      this.socket = null;
      this.isConnected = false;
    }
  }
}
