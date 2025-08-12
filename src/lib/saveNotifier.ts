let lastSuccess = 0;
export function savedToast(toastFn: (m: string) => any) {
  const now = Date.now();
  if (now - lastSuccess > 2000) {
    toastFn('Saved');
    lastSuccess = now;
  }
}
