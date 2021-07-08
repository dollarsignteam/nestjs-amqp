/**
 * @returns generated id
 */
export function getID(): string {
  const start = BigInt(Date.now()) * BigInt(1e6) - process.hrtime.bigint();
  return `${start + process.hrtime.bigint()}`;
}
