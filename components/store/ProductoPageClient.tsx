'use client';

import { AddToCartButton } from '@/components/store/AddToCartButton';
import { GuaranteeBadges } from '@/components/store/GuaranteeBadges';
import { ProductImageGallery } from '@/components/store/ProductImageGallery';
import { SizeGuideModal } from '@/components/store/SizeGuideModal';
import { TrustBadges } from '@/components/store/TrustBadges';
import { VariantSelector } from '@/components/store/VariantSelector';
import { Button } from '@/components/ui/button';
import { trackProductView, trackWhatsAppClick } from '@/lib/analytics';
import { getCategoryColor } from '@/lib/data/categories';
import type { ChamanaModel, Variante } from '@/lib/data/products';
import { getModelMinPrice } from '@/lib/data/products';
import { isProximamente, telaDescripcion } from '@/lib/domain/catalog';
import { formatPrice } from '@/lib/utils';
import { generateSingleProductUrl } from '@/lib/whatsapp';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProductoPageClientProps {
  model: ChamanaModel;
}

export function ProductoPageClient({ model }: ProductoPageClientProps) {
  const proximamente = isProximamente(model);
  const modelImages = model.imagenes ?? [];
  const [selectedVariante, setSelectedVariante] = useState<Variante | undefined>(
    model.variantes[0]
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    trackProductView(model.slug, model.nombre, model.tipo, getModelMinPrice(model));
  }, [model]);

  const catColor = getCategoryColor(model.tipo);

  const whatsappUrl = selectedVariante
    ? generateSingleProductUrl(
        model.nombre,
        model.tipo,
        telaDescripcion(selectedVariante.tela1),
        selectedVariante.tela2 ? telaDescripcion(selectedVariante.tela2) : undefined,
        selectedVariante.precio
      )
    : generateSingleProductUrl(model.nombre, model.tipo, 'Proximamente');

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('product', model.nombre, selectedVariante?.precio);
  };

  return (
    <div className="container py-6 px-4">
      {/* Back */}
      <Link href="/tienda">
        <Button variant="ghost" size="sm" className="mb-4 gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <ProductImageGallery images={modelImages} nombre={model.nombre} catColor={catColor} />

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {model.tipo}
            {model.detalle ? ` · ${model.detalle}` : ''}
          </span>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold font-titles">{model.nombre}</h1>
            {model.badge && (
              <span className="text-xs font-semibold bg-cta text-cta-foreground px-2 py-0.5 rounded-full">
                {model.badge}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{model.descripcion}</p>

          {/* Price */}
          {!proximamente && selectedVariante && (
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl font-semibold text-foreground">
                {formatPrice(selectedVariante.precio)}
              </p>
              {selectedVariante.precioAnterior && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(selectedVariante.precioAnterior)}
                </span>
              )}
              {selectedVariante.descuento && (
                <span className="text-xs font-semibold bg-cta text-cta-foreground px-2 py-0.5 rounded-full">
                  -{selectedVariante.descuento}%
                </span>
              )}
            </div>
          )}

          {proximamente ? (
            <div className="mb-8 py-4 px-5 rounded-lg bg-muted/30 border border-border/30 text-center">
              <p className="text-sm font-medium text-muted-foreground">Proximamente</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Este modelo estara disponible pronto
              </p>
            </div>
          ) : (
            <>
              {/* Variant Selector */}
              {selectedVariante && (
                <div className="mb-4">
                  <VariantSelector
                    variantes={model.variantes}
                    selected={selectedVariante}
                    onSelect={setSelectedVariante}
                  />
                </div>
              )}

              {/* Size Guide */}
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors mb-6"
                onClick={() => setShowSizeGuide(true)}
              >
                Guia de Talles
              </button>

              {/* Actions */}
              {selectedVariante && (
                <div className="space-y-3 mt-auto">
                  <AddToCartButton model={model} variante={selectedVariante} />
                  <Button asChild variant="cta" className="w-full gap-2" size="lg">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Pedir por WhatsApp
                    </a>
                  </Button>
                </div>
              )}

              {/* Trust & Guarantees */}
              <div className="mt-6 space-y-4">
                <TrustBadges />
                <GuaranteeBadges />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal tipo={model.tipo} onClose={() => setShowSizeGuide(false)} />
      )}
    </div>
  );
}
