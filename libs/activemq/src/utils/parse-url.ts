import { AMQPTransport, ConnectionURL } from '../interfaces';

/**
 * @param url - url string
 * @returns connection url object
 */
export function parseURL(url: string): ConnectionURL {
  const { protocol, username, password, hostname, port } = new URL(url);
  let transport: AMQPTransport;
  switch (protocol) {
    case 'amqp:':
      transport = 'tcp';
      break;
    case 'amqps:':
      transport = 'ssl';
      break;
    case 'amqp+ssl:':
      transport = 'ssl';
      break;
    case 'amqp+tls:':
      transport = 'tls';
      break;
    default:
      throw new Error(`Not supported connection protocol: ${protocol}`);
  }
  const connectionURL: ConnectionURL = {
    password,
    username,
    transport,
    host: hostname,
    port: Number.parseInt(port, 10),
  };
  return connectionURL;
}
