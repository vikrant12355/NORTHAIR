/**
 * Date and time parsing utilities for Indian Standard Time (IST)
 */
export function formatISTDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function isValidDateString(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

