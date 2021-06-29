import { ActiveMQModuleOptions } from '../../interfaces';
import { getConnectionToken } from '../get-connection-token';
describe('getConnectionToken', () => {
  it('should return `defaultConnection`', () => {
    const result = getConnectionToken();
    expect(result).toBe('defaultConnection');
  });

  it('should return `defaultConnection` when input is empty string', () => {
    const result = getConnectionToken('');
    expect(result).toBe('defaultConnection');
  });

  it('should return `testConnection` when input is `test`', () => {
    const result = getConnectionToken('test');
    expect(result).toBe('testConnection');
  });

  it('should return `defaultConnection` when input is empty option', () => {
    const option: ActiveMQModuleOptions = {};
    const result = getConnectionToken(option);
    expect(result).toBe('defaultConnection');
  });

  it('should return `demoConnection` when option name is `demo`', () => {
    const option: ActiveMQModuleOptions = { name: 'demo' };
    const result = getConnectionToken(option);
    expect(result).toBe('demoConnection');
  });
});
