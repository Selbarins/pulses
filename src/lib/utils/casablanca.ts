/** YYYY-MM-DD in Africa/Casablanca */
export function casablancaDate(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
