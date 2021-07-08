import { getID } from '../get-id';

describe('getID', () => {
  it('should return generated id', () => {
    const result = getID();
    expect(result).toHaveLength(19);
  });
});
