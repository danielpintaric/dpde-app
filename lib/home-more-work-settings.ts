/**
 * More work tile count (shared by admin client UI and server services).
 * Keep this module free of `server-only` / DB imports so client components can import it.
 */

export const HOME_MORE_WORK_COUNT_OPTIONS = [6, 9, 12] as const;

export function clampHomeMoreWorkCount(n: unknown): number {
  let x: number;
  if (typeof n === "number" && Number.isFinite(n)) {
    x = Math.round(n);
  } else if (n != null && String(n).trim() !== "") {
    const p = parseInt(String(n), 10);
    x = Number.isFinite(p) ? p : 6;
  } else {
    return 6;
  }
  if (x === 6 || x === 9 || x === 12) {
    return x;
  }
  return 6;
}
