export function formatUtc(iso: string, opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }) {
  try {
    return new Date(iso).toLocaleString(undefined, opts);
  } catch {
    return iso;
  }
}
export function currentIsoUtc() { return new Date().toISOString(); }
