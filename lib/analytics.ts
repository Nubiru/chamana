type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
};

export function trackEvent({ action, category, label, value, ...rest }: GtagEvent) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...rest,
    });
  }
}

export function trackProductView(slug: string, nombre: string, tipo: string, precio?: number) {
  trackEvent({
    action: 'view_item',
    category: 'ecommerce',
    label: nombre,
    item_id: slug,
    item_name: nombre,
    item_category: tipo,
    ...(precio != null ? { value: precio, currency: 'ARS' } : {}),
  });
}

export function trackAddToCart(
  slug: string,
  nombre: string,
  tipo: string,
  varianteId: string,
  precio?: number
) {
  trackEvent({
    action: 'add_to_cart',
    category: 'ecommerce',
    label: `${nombre} - ${varianteId}`,
    item_id: slug,
    item_name: nombre,
    item_category: tipo,
    ...(precio != null ? { value: precio, currency: 'ARS' } : {}),
  });
}

export function trackWhatsAppClick(
  type: 'general' | 'product' | 'cart',
  label?: string,
  value?: number
) {
  trackEvent({
    action: `whatsapp_${type}`,
    category: 'engagement',
    label: label ?? type,
    ...(value != null ? { value } : {}),
  });
}

export function trackCategoryView(categoryName: string) {
  trackEvent({
    action: 'view_category',
    category: 'navigation',
    label: categoryName,
  });
}

export function trackLeadCapture(source: string) {
  trackEvent({
    action: 'lead_capture',
    category: 'engagement',
    label: source,
  });
}

export function trackLeadDismiss() {
  trackEvent({
    action: 'lead_dismiss',
    category: 'engagement',
  });
}
