/**
 * Pragya Time Utility
 * All server operations store and process timestamps in UTC ISO strings.
 * Clients format timestamps according to the detected or user-configured timezone.
 */

export function getCurrentUtcIso(): string {
  return new Date().toISOString();
}

export function getCurrentUtcTimestamp(): number {
  return Date.now();
}

export function formatInTimezone(
  utcIsoString: string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcIsoString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

export function getRemainingSeconds(expiresAtUtcIso: string): number {
  const targetTime = new Date(expiresAtUtcIso).getTime();
  const currentTime = Date.now();
  const diff = Math.floor((targetTime - currentTime) / 1000);
  return Math.max(0, diff);
}

export function isExpired(expiresAtUtcIso: string): boolean {
  return getRemainingSeconds(expiresAtUtcIso) <= 0;
}

export function addMinutesToUtc(utcIsoString: string, minutes: number): string {
  const date = new Date(utcIsoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export function addSecondsToUtc(utcIsoString: string, seconds: number): string {
  const date = new Date(utcIsoString);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString();
}

export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (err) {
    return 'UTC';
  }
}
