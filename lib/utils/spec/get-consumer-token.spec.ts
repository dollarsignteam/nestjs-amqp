import { getConsumerToken } from '../get-consumer-token';

describe('getConsumerToken', () => {
  it('should return token string', () => {
    const result = getConsumerToken('demo');
    expect(result).toBe('demo:consumer:default:connection');
  });
});
