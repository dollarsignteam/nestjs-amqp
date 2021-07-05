import { AMQPModuleOptions } from '../../interfaces';
import { getConnectionToken } from '../get-connection-token';
describe('getConnectionToken', () => {
  it('should return `default:connection`', () => {
    const result = getConnectionToken();
    expect(result).toBe('default:connection');
  });

  it('should return `default:connection` when input is empty string', () => {
    const result = getConnectionToken('');
    expect(result).toBe('default:connection');
  });

  it('should return `test:connection` when input is `test`', () => {
    const result = getConnectionToken('test');
    expect(result).toBe('test:connection');
  });

  it('should return `default:connection` when input is empty option', () => {
    const option: AMQPModuleOptions = {};
    const result = getConnectionToken(option);
    expect(result).toBe('default:connection');
  });

  it('should return `demo:connection` when option name is `demo`', () => {
    const option: AMQPModuleOptions = { name: 'demo' };
    const result = getConnectionToken(option);
    expect(result).toBe('demo:connection');
  });
});
