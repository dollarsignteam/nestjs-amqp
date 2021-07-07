import { getToken } from '../get-token';

describe('getToken', () => {
  it('should return `undefined`', () => {
    const result = getToken(undefined);
    expect(result).toBe('undefined');
  });

  it('should return token string', () => {
    const result = getToken(' Demo token 1');
    expect(result).toBe('demo-token-1');
  });
});
