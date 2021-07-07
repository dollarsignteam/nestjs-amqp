import { getProducerToken } from '../get-producer-token';

describe('getProducerToken', () => {
  it('should return token string', () => {
    const result = getProducerToken();
    expect(result).toBe('producer:default:connection');
  });
});
