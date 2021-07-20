import { getLogger } from '../get-logger';

describe('getLogger', () => {
  it('should be defined', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
  });
});
