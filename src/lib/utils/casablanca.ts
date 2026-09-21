/**
 * Dates in Africa/Casablanca.
 * Display format: DD/MM/YYYY
 * ISO helper kept for safe storage / comparison.
 */

function parts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-GB → DD/MM/YYYY
  const s = fmt.format(d); // e.g. "21/09/2026"
  const [dd, mm, yyyy] = s.split("/");
  return { dd, mm, yyyy, display: s };
}

/** Display / UI: DD/MM/YYYY */
export function casablancaDate(d = new Date()): string {
  return parts(d).display;
}

/** Sortable key: YYYY-MM-DD (use this for dayLog.date storage + seal logic) */
export function casablancaDateISO(d = new Date()): string {
  const { dd, mm, yyyy } = parts(d);
  return `${yyyy}-${mm}-${dd}`;
}

/** Parse DD/MM/YYYY or YYYY-MM-DD → comparable YYYY-MM-DD */
export function toISODateKey(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [dd, mm, yyyy] = date.split("/");
  if (yyyy && mm && dd) return `${yyyy}-${mm}-${dd}`;
  return date;
}

/** true if `a` is strictly before `b` (either format) */
export function isBeforeDate(a: string, b: string): boolean {
  return toISODateKey(a) < toISODateKey(b);
}
