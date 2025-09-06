type AnalyticsEvent = {
  type: 'event' | 'pageview';
  name?: string;
  path?: string;
  title?: string;
  data?: Record<string, unknown>;
  ts: number;
};

function isTelemetryEnabled(): boolean {
  try {
    const raw = localStorage.getItem('app-settings');
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    if (typeof parsed.telemetry === 'boolean') return parsed.telemetry;
    return true;
  } catch {
    return true;
  }
}

function getEndpoint(): string | null {
  const endpoint = (import.meta as any).env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
  return endpoint && endpoint.length > 0 ? endpoint : null;
}

function send(payload: AnalyticsEvent) {
  if (!isTelemetryEnabled()) return;
  const endpoint = getEndpoint();
  if (!endpoint) {
    if (import.meta.env.DEV) {
      console.debug('[analytics]', payload);
    }
    return;
  }
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  send({ type: 'event', name, data, ts: Date.now() });
}

export function trackPageView(path: string, title?: string) {
  send({ type: 'pageview', path, title, ts: Date.now() });
}

export function initAnalytics() {
  trackEvent('app_loaded');
}

