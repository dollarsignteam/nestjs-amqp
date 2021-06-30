import { ActiveMQModuleOptions } from '../../interfaces';
import { getConnectionToken } from '../get-connection-token';
describe('getConnectionToken', () => {
  it('should return `DEFAULT_CONNECTION`', () => {
    const result = getConnectionToken();
    expect(result).toBe('DEFAULT_CONNECTION');
  });

  it('should return `DEFAULT_CONNECTION` when input is empty string', () => {
    const result = getConnectionToken('');
    expect(result).toBe('DEFAULT_CONNECTION');
  });

  it('should return `TEST_CONNECTION` when input is `test`', () => {
    const result = getConnectionToken('test');
    expect(result).toBe('TEST_CONNECTION');
  });

  it('should return `DEFAULT_CONNECTION` when input is empty option', () => {
    const option: ActiveMQModuleOptions = {};
    const result = getConnectionToken(option);
    expect(result).toBe('DEFAULT_CONNECTION');
  });

  it('should return `DEMO_CONNECTION` when option name is `demo`', () => {
    const option: ActiveMQModuleOptions = { name: 'demo' };
    const result = getConnectionToken(option);
    expect(result).toBe('DEMO_CONNECTION');
  });
});
