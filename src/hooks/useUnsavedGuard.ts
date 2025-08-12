import { useEffect } from 'react';

export function useUnsavedGuard(dirty: boolean, message = 'You have unsaved changes.') {
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = message; // required for Chrome
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, message]);
}
