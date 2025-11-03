/**
 * Google Analytics 4 - Módulo separado
 * Evita uso de 'unsafe-inline' no CSP carregando script dinamicamente
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

// Carregar script do Google Analytics dinamicamente
function loadGAScript(measurementId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

// Configurar Google Analytics
export function initGA(measurementId: string) {
  // Carregar script externo
  loadGAScript(measurementId);
  
  // Configurar tracking
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
