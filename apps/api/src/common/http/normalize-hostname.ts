export function normalizeHostname(hostname: string): string {
  return (
    hostname
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      ?.split(':')[0] ?? ''
  );
}
