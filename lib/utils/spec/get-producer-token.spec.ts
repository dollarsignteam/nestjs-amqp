import { getProducerToken } from '../get-producer-token';

describe('getProducerToken', () => {
  it('should return token string', () => {
    const result = getProducerToken('demo');
    expect(result).toBe('demo:producer:default:connection');
  });
});
