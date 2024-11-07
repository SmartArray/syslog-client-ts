# SyslogClient for Node.js

A TypeScript implementation of a syslog client for Node.js that sends RFC 5424
formatted messages over TCP or UDP to a syslog server.

## Features

- **Supports TCP and UDP**: Choose between TCP or UDP transport protocols.
- **RFC 5424 Compliance**: Sends properly formatted syslog messages.
- **Customizable Identity**: Override default options with custom identity
  settings.
- **EventEmitter Integration**: Emits `connect`, `disconnect`, and `error`
  events.
- **Reconnection Logic**: Automatic reconnection support for TCP connections.
- **TypeScript Support**: Fully typed for better development experience.

## Installation

Install the package using npm:

```bash
npm install syslog-client-ts
```

## Usage

### Importing the Module

```typescript
import {
  Facility,
  Identity,
  Severity,
  SyslogClient,
  TCPOptions,
} from 'syslog-client';
```

### Creating an Identity

Define an `Identity` object with your desired settings:

```typescript
const identity: Identity = {
  facility: Facility.LOCAL0,
  severity: Severity.INFORMATIONAL,
  appName: 'SpiderVerse',
  syslogHostname: 'spiderverse.dev',
  // pid is optional and defaults to process.pid
};
```

### Instantiating the Client

Create a new `SyslogClient` instance:

```typescript
const client = new SyslogClient({
  hostname: 'syslog-server.example.com',
  port: 514,
  transport: 'tcp', // or udp
  identity: identity,
  {
    timeout: 5000,
    reconnect: true,
    reconnectInterval: 2000,
  },
);
```

### Connecting to the Syslog Server

Connect to the server using the `connect` method:

```typescript
client
  .connect()
  .then(() => {
    console.log('Connected to syslog server');
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
```

### Sending a Log Message

Use the `log` method to send messages:

```typescript
client
  .log('This is a test message')
  .then(() => {
    console.log('Message sent successfully');
  })
  .catch(err => {
    console.error('Error sending message:', err);
  });
```

### Handling Events

Listen to events emitted by the client:

```typescript
client.on('connect', () => {
  console.log('Client connected');
});

client.on('disconnect', () => {
  console.log('Client disconnected');
});

client.on('error', err => {
  console.error('An error occurred:', err);
});
```

### Disconnecting

When done, disconnect the client:

```typescript
client.disconnect();
```

## API Reference

### SyslogClient Class

#### Constructor

```typescript
new SyslogClient({
  options: SyslogClientOptions,
  defaultIdentity: IIdentity,
  options?: ITCPOptions,
});
```

- `hostname`: Syslog server hostname or IP address.
- `port`: Port number of the syslog server.
- `transport`: Transport protocol (`'tcp'` or `'udp'`).
- `identity`: Identity object containing facility, severity, appName, etc.
- `options`: Optional TCP options (only applicable for TCP transport).

#### Methods

- `connect(): Promise<void>`: Connects to the syslog server.
- `log(message: string, options?: LogOptions): Promise<void>`: Sends a log
  message.
- `disconnect(): void`: Disconnects from the syslog server.

#### Events

- `connect`: Emitted upon successful connection.
- `disconnect`: Emitted when the connection is closed.
- `error`: Emitted when an error occurs.

### Interfaces

#### Identity

```typescript
interface IIdentity {
  facility: FacilityType;
  severity: SeverityType;
  appName: string;
  syslogHostname: string;
  pid?: number;
}
```

#### TCP Options

```typescript
interface ITCPOptions {
  timeout?: number; // Socket timeout in milliseconds
  reconnect?: boolean; // Enable automatic reconnection
  reconnectInterval?: number; // Interval between reconnection attempts in milliseconds
}
```

### Enums

#### Facility

```typescript
enum Facility {
  KERNEL = 0,
  USER = 1,
  MAIL = 2,
  SYSTEM = 3,
  DAEMON = 3,
  AUTH = 4,
  SYSLOG = 5,
  LPR = 6,
  NEWS = 7,
  UUCP = 8,
  CRON = 9,
  AUTHPRIV = 10,
  FTP = 11,
  AUDIT = 13,
  ALERT = 14,
  LOCAL0 = 16,
  LOCAL1 = 17,
  LOCAL2 = 18,
  LOCAL3 = 19,
  LOCAL4 = 20,
  LOCAL5 = 21,
  LOCAL6 = 22,
  LOCAL7 = 23,
}
```

#### Severity

```typescript
enum Severity {
  EMERGENCY = 0,
  ALERT = 1,
  CRITICAL = 2,
  ERROR = 3,
  WARNING = 4,
  NOTICE = 5,
  INFORMATIONAL = 6,
  DEBUG = 7,
}
```

## Examples

### Sending a Simple Message

```typescript
await client.log('System started successfully');
```

### Overriding Facility and Severity

```typescript
await client.log('Disk space low', {
  facility: Facility.SYSTEM,
  severity: Severity.WARNING,
});
```

### Using a Custom Identity

```typescript
const customIdentity: Identity = {
  facility: Facility.LOCAL1,
  severity: Severity.ERROR,
  appName: 'CustomApp',
  syslogHostname: 'custom-host',
  pid: 12345,
};

await client.log('Custom error message', customIdentity);
```

### Handling Reconnection

Enable automatic reconnection for TCP transport:

```typescript
const client = new SyslogClient({
  hostname: 'syslog-server.example.com',
  port: 514,
  transport: 'tcp',
  identity: identity,
  {
    reconnect: true,
    reconnectInterval: 5000,
  },
);
```

## Error Handling

Listen for errors to handle exceptions:

```typescript
client.on('error', err => {
  console.error('Error:', err.message);
});
```

## Best Practices

- **TCP vs UDP**: Use TCP for reliable delivery, UDP for lower overhead.
- **Event Listeners**: Listen to `error` events to catch and handle exceptions.
- **Resource Management**: Call `disconnect()` when the client is no longer
  needed.

## Development

### Building the Project

Compile the TypeScript code using:

```bash
yarn build
```

### Running Tests

```bash
yarn test
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by the need for a flexible syslog client in Node.js applications.
- Follows the RFC 5424 standard for syslog message formatting.

## Contact

For questions or support, please open an issue on the GitHub repository.
