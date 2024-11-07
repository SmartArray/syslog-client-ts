export interface ISyslogClientOptions {
  hostname: string;
  port?: number;
  transport?: 'tcp' | 'udp';
}
