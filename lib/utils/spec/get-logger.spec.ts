import { getLogger } from '../get-logger';

describe('getLogger', () => {
  it('should be defined', () => {
    const logger = getLogger('test');
    expect(logger).toBeDefined();
  });
});
