/**
 * Google Analytics 4 - Módulo separado
 * Evita uso de 'unsafe-inline' no CSP
 */

// Inicializar dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

window.dataLayer = window.dataLayer || [];

export function gtag(..._args: any[]) {
  window.dataLayer.push(arguments);
}

window.gtag = gtag;

// Configurar Google Analytics
export function initGA(measurementId: string) {
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false, // Controlar manualmente pageviews
  });
}

// Track pageview
export function trackPageView(url: string, title: string) {
  if (typeof window.gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: title,
      page_location: url,
      page_path: new URL(url).pathname,
    });
  }
}

// Track event
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window.gtag !== 'undefined') {
    gtag('event', eventName, eventParams);
  }
}
