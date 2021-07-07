import { parseURL } from '../parse-url';

describe('parseURL', () => {
  it('should throw error when input is http protocol', () => {
    const result = expect(() => parseURL('http://localhost:8080'));
    result.toThrow('Not supported connection protocol: http:');
  });

  it('should work with amqp:// protocol', () => {
    const result = parseURL('amqp://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'tcp' }));
  });

  it('should work with amqps:// protocol', () => {
    const result = parseURL('amqps://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'ssl' }));
  });

  it('should work with amqp+ssl:// protocol', () => {
    const result = parseURL('amqp+ssl://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'ssl' }));
  });

  it('should work with amqp+tls:// protocol', () => {
    const result = parseURL('amqp+tls://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'tls' }));
  });
});
