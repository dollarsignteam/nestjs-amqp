import { ConnectionOptions } from 'rhea-promise';

import { ConnectionURL } from '../interfaces';

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

/**
 * @param url - url string
 * @returns connection url object
 */
export function parseURL(url: string): ConnectionURL {
  const { protocol, username, password, hostname, port } = new URL(url);
  let transport: PropType<ConnectionOptions, 'transport'>;
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
