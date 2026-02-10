'use client';

import { AddToCartButton } from '@/components/store/AddToCartButton';
import { ProductCard } from '@/components/store/ProductCard';
import { VariantSelector } from '@/components/store/VariantSelector';
import { Button } from '@/components/ui/button';
import { telaDescripcion } from '@/lib/data/fabrics';
import { MODELOS, getModelBySlug } from '@/lib/data/products';
import type { Variante } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';
import { generateSingleProductUrl } from '@/lib/whatsapp';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';

const MODEL_GRADIENTS: Record<string, string> = {
  Falda: 'from-amber-50 to-orange-100',
  Vestido: 'from-rose-50 to-pink-100',
  Kimono: 'from-emerald-50 to-teal-100',
  Remeron: 'from-sky-50 to-blue-100',
  Musculosa: 'from-violet-50 to-purple-100',
  Top: 'from-fuchsia-50 to-pink-100',
  Camisa: 'from-lime-50 to-green-100',
  Bermuda: 'from-yellow-50 to-amber-100',
  Short: 'from-cyan-50 to-sky-100',
  Palazzo: 'from-indigo-50 to-violet-100',
};

export default function ProductoPage() {
  const params = useParams<{ slug: string }>();
  const model = getModelBySlug(params.slug);

  if (!model) {
    notFound();
  }

  const isProximamente = model.variantes.length === 0;
  const modelImages = model.imagenes ?? [];
  const [selectedVariante, setSelectedVariante] = useState<Variante | undefined>(
    model.variantes[0]
  );
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const gradient = MODEL_GRADIENTS[model.tipo] || 'from-gray-50 to-gray-100';

  const relatedModels = MODELOS.filter((m) => m.tipo === model.tipo && m.slug !== model.slug).slice(
    0,
    4
  );

  const whatsappUrl = selectedVariante
    ? generateSingleProductUrl(
        model.nombre,
        model.tipo,
        telaDescripcion(selectedVariante.tela1),
        selectedVariante.tela2 ? telaDescripcion(selectedVariante.tela2) : undefined,
        selectedVariante.precio
      )
    : generateSingleProductUrl(model.nombre, model.tipo, 'Proximamente');

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
        {/* Image */}
        <div className="space-y-3">
          <div
            className={`aspect-square bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center relative overflow-hidden`}
          >
            {modelImages.length > 0 ? (
              <Image
                src={modelImages[selectedImageIdx]}
                alt={`${model.nombre} - Foto ${selectedImageIdx + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="text-center">
                <Sparkles className="h-16 w-16 mx-auto text-foreground/10 mb-2" />
                <span className="text-7xl font-titles text-foreground/10">
                  {model.nombre.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail row */}
          {modelImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {modelImages.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === selectedImageIdx
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${model.nombre} - Miniatura ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {model.tipo}
            {model.detalle ? ` · ${model.detalle}` : ''}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold font-titles mb-4">{model.nombre}</h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{model.descripcion}</p>

          {/* Price */}
          {!isProximamente && selectedVariante && (
            <p className="text-2xl font-semibold text-foreground mb-6">
              {formatPrice(selectedVariante.precio)}
            </p>
          )}

          {isProximamente ? (
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
                <div className="mb-8">
                  <VariantSelector
                    variantes={model.variantes}
                    selected={selectedVariante}
                    onSelect={setSelectedVariante}
                  />
                </div>
              )}

              {/* Actions */}
              {selectedVariante && (
                <div className="space-y-3 mt-auto">
                  <AddToCartButton model={model} variante={selectedVariante} />
                  <Button asChild variant="outline" className="w-full gap-2" size="lg">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5" />
                      Consultar por WhatsApp
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedModels.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold font-titles mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {relatedModels.map((m) => (
              <ProductCard key={m.slug} model={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
