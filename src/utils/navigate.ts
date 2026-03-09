let nav: ((to: string, options?: { replace?: boolean }) => void) | null = null;
let queued: { to: string; options?: { replace?: boolean } } | null = null;

export const setNavigator = (fn: (to: string, options?: { replace?: boolean }) => void) => {
  nav = fn;
  if (nav && queued) {
    const { to, options } = queued;
    queued = null;
    try {
      nav(to, options);
      return;
    } catch {
      // fall through to history fallback
    }
  }
};

export const navigateTo = (to: string, options?: { replace?: boolean }) => {
  try {
    if (typeof window !== "undefined" && window.location.pathname === to) return;
    // Use router navigate when available
    if (nav) {
      nav(to, options);
      return;
    }
    // Queue until navigator is registered; do NOT touch location/history to avoid reload
    queued = { to, options };
  } catch {
    // Silent no-op to avoid breaking the app
  }
};
