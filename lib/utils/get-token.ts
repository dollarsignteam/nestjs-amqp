/**
 * @param name - token name
 * @returns token string of name
 */
export function getToken(name: string): string {
  return `${name}`.trim().toLowerCase().replace(/\s+/g, '-');
}
