import {
  trackAddToCart,
  trackCategoryView,
  trackEvent,
  trackLeadCapture,
  trackLeadDismiss,
  trackProductView,
  trackWhatsAppClick,
} from '@/lib/analytics';

describe('analytics facade', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    window.gtag = mockGtag;
  });

  afterEach(() => {
    (window as any).gtag = undefined;
  });

  // ---------------------------------------------------------------------------
  // trackEvent
  // ---------------------------------------------------------------------------
  describe('trackEvent', () => {
    it('calls window.gtag with correct event name and params', () => {
      trackEvent({ action: 'test_action', category: 'test_category', label: 'lbl', value: 42 });

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_action', {
        event_category: 'test_category',
        event_label: 'lbl',
        value: 42,
      });
    });

    it('does not throw when window.gtag is undefined (consent not given)', () => {
      (window as any).gtag = undefined;

      expect(() => {
        trackEvent({ action: 'x', category: 'y' });
      }).not.toThrow();
    });

    it('includes extra properties via rest spread', () => {
      trackEvent({ action: 'a', category: 'b', custom_dim: 'dim_value', custom_metric: 99 });

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'a',
        expect.objectContaining({
          custom_dim: 'dim_value',
          custom_metric: 99,
        })
      );
    });

    it('omits undefined label and value', () => {
      trackEvent({ action: 'a', category: 'b' });

      const params = mockGtag.mock.calls[0][2];
      expect(params.event_label).toBeUndefined();
      expect(params.value).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // trackProductView
  // ---------------------------------------------------------------------------
  describe('trackProductView', () => {
    it("calls gtag with action 'view_item' and category 'ecommerce'", () => {
      trackProductView('hechizo', 'Hechizo', 'Falda');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({ event_category: 'ecommerce' })
      );
    });

    it('includes item_id, item_name, item_category', () => {
      trackProductView('sabia', 'Sabia', 'Remeron');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({
          item_id: 'sabia',
          item_name: 'Sabia',
          item_category: 'Remeron',
        })
      );
    });

    it("includes value and currency 'ARS' when precio provided", () => {
      trackProductView('hechizo', 'Hechizo', 'Falda', 25000);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({ value: 25000, currency: 'ARS' })
      );
    });

    it('omits value and currency when precio is undefined', () => {
      trackProductView('hechizo', 'Hechizo', 'Falda');

      const params = mockGtag.mock.calls[0][2];
      expect(params).not.toHaveProperty('currency');
      expect(params.value).toBeUndefined();
    });

    it('handles precio=0 as valid (includes value: 0)', () => {
      trackProductView('hechizo', 'Hechizo', 'Falda', 0);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({ value: 0, currency: 'ARS' })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // trackAddToCart
  // ---------------------------------------------------------------------------
  describe('trackAddToCart', () => {
    it("calls gtag with action 'add_to_cart'", () => {
      trackAddToCart('hechizo', 'Hechizo', 'Falda', 'hechizo-linmenchoc');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'add_to_cart',
        expect.objectContaining({ event_category: 'ecommerce' })
      );
    });

    it("formats label as 'nombre - varianteId'", () => {
      trackAddToCart('espejo', 'Espejo', 'Top', 'espejo-ribmilitar-tejnegro');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'add_to_cart',
        expect.objectContaining({ event_label: 'Espejo - espejo-ribmilitar-tejnegro' })
      );
    });

    it('includes precio as value when provided', () => {
      trackAddToCart('hechizo', 'Hechizo', 'Falda', 'hechizo-linmenchoc', 25000);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'add_to_cart',
        expect.objectContaining({ value: 25000, currency: 'ARS' })
      );
    });

    it('omits value when precio undefined', () => {
      trackAddToCart('hechizo', 'Hechizo', 'Falda', 'hechizo-linmenchoc');

      const params = mockGtag.mock.calls[0][2];
      expect(params).not.toHaveProperty('currency');
      expect(params.value).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // trackWhatsAppClick
  // ---------------------------------------------------------------------------
  describe('trackWhatsAppClick', () => {
    it("calls gtag with action 'whatsapp_general' for type 'general'", () => {
      trackWhatsAppClick('general');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'whatsapp_general',
        expect.objectContaining({ event_category: 'engagement' })
      );
    });

    it("calls gtag with action 'whatsapp_product' for type 'product'", () => {
      trackWhatsAppClick('product');

      expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_product', expect.anything());
    });

    it("calls gtag with action 'whatsapp_cart' for type 'cart'", () => {
      trackWhatsAppClick('cart');

      expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_cart', expect.anything());
    });

    it('uses custom label when provided', () => {
      trackWhatsAppClick('product', 'Hechizo Falda');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'whatsapp_product',
        expect.objectContaining({ event_label: 'Hechizo Falda' })
      );
    });

    it('uses type as label when no custom label', () => {
      trackWhatsAppClick('general');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'whatsapp_general',
        expect.objectContaining({ event_label: 'general' })
      );
    });

    it('includes value when provided', () => {
      trackWhatsAppClick('cart', 'checkout', 85000);

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'whatsapp_cart',
        expect.objectContaining({ value: 85000 })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // trackCategoryView
  // ---------------------------------------------------------------------------
  describe('trackCategoryView', () => {
    it("calls gtag with action 'view_category' and label = category name", () => {
      trackCategoryView('Faldas');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_category', {
        event_category: 'navigation',
        event_label: 'Faldas',
        value: undefined,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // trackLeadCapture
  // ---------------------------------------------------------------------------
  describe('trackLeadCapture', () => {
    it("calls gtag with action 'lead_capture' and label = source", () => {
      trackLeadCapture('popup_newsletter');

      expect(mockGtag).toHaveBeenCalledWith('event', 'lead_capture', {
        event_category: 'engagement',
        event_label: 'popup_newsletter',
        value: undefined,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // trackLeadDismiss
  // ---------------------------------------------------------------------------
  describe('trackLeadDismiss', () => {
    it("calls gtag with action 'lead_dismiss'", () => {
      trackLeadDismiss();

      expect(mockGtag).toHaveBeenCalledWith('event', 'lead_dismiss', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // consent gating
  // ---------------------------------------------------------------------------
  describe('consent gating', () => {
    it('when window.gtag is not defined, no calls made and no error thrown', () => {
      (window as any).gtag = undefined;

      expect(() => trackProductView('x', 'X', 'T')).not.toThrow();
      expect(() => trackAddToCart('x', 'X', 'T', 'v1')).not.toThrow();
      expect(() => trackWhatsAppClick('general')).not.toThrow();
      expect(() => trackCategoryView('C')).not.toThrow();
      expect(() => trackLeadCapture('s')).not.toThrow();
      expect(() => trackLeadDismiss()).not.toThrow();
      // No gtag mock to check — just verify no error
    });

    it('when window.gtag is not a function (e.g. string), no call made', () => {
      (window as any).gtag = 'not-a-function';

      expect(() => trackEvent({ action: 'test', category: 'test' })).not.toThrow();
      // The string is not callable, so nothing should have been invoked
    });
  });
});
