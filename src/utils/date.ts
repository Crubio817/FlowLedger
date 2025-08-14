export function formatUtc(iso: string, opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }) {
  try {
    return new Date(iso).toLocaleString(undefined, opts);
  } catch {
    return iso;
  }
}
export function currentIsoUtc() { return new Date().toISOString(); }

export function formatRelativeTime(iso:string){
  try{
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.round((now - then)/1000);
    if(diff < 60) return `${diff}s ago`;
    if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }catch{return iso}
}
