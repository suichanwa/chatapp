export type EntryTarget = 'desktop' | 'mobile';

const STORAGE_KEY = 'securechat:entryTarget';

export function setPreferredTarget(target: EntryTarget): void {
  localStorage.setItem(STORAGE_KEY, target);
  location.reload();
}

export function getPreferredTarget(): EntryTarget {
  const saved = (localStorage.getItem(STORAGE_KEY) || '').toLowerCase();
  if (saved === 'desktop' || saved === 'mobile') return saved as EntryTarget;
  return isMobileEnv() ? 'mobile' : 'desktop';
}

export function isMobileEnv(): boolean {
  const ua = navigator.userAgent;
  const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isCapacitor = !!(window as any).Capacitor;
  return isMobileUA || isCapacitor;
}