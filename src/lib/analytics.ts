declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Inicializa o Google Analytics (GA4) se o ID de medição for fornecido.
 * Insere as tags dinamicamente sem poluir o index.html principal.
 */
export function initGA(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  // Evita carregamento duplicado
  if (document.getElementById('google-analytics-script')) return;

  try {
    // Inserir tag de script do Google Analytics
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Inicializar dataLayer e a função gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure' // Melhora compatibilidade com iframe do AI Studio
    });

    console.log(`[Analytics] Google Analytics 4 inicializado com o ID: ${measurementId}`);
  } catch (err) {
    console.error('[Analytics] Erro ao inicializar o Google Analytics:', err);
  }
}

/**
 * Regista uma visualização de página/secção específica.
 */
export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: `${window.location.pathname}#${pageName}`,
        send_to: gaId
      });
      console.log(`[Analytics] Visualização de página registada: ${pageName}`);
    }
  }
}

/**
 * Regista um evento personalizado (ex: submissão de simulado, login, clique).
 */
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log(`[Analytics] Evento registado: ${action} [${category}]`);
  }
}
