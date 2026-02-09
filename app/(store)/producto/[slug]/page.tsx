'use client';

import { AddToCartButton } from '@/components/store/AddToCartButton';
import { ProductCard } from '@/components/store/ProductCard';
import { VariantSelector } from '@/components/store/VariantSelector';
import { Button } from '@/components/ui/button';
import { telaDescripcion } from '@/lib/data/fabrics';
import { MODELOS, getModelBySlug } from '@/lib/data/products';
import type { Variante } from '@/lib/data/products';
import { generateSingleProductUrl } from '@/lib/whatsapp';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
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

  const [selectedVariante, setSelectedVariante] = useState<Variante>(model.variantes[0]);

  const gradient = MODEL_GRADIENTS[model.tipo] || 'from-gray-50 to-gray-100';

  const relatedModels = MODELOS.filter((m) => m.tipo === model.tipo && m.slug !== model.slug).slice(
    0,
    4
  );

  const whatsappUrl = generateSingleProductUrl(
    model.nombre,
    model.tipo,
    telaDescripcion(selectedVariante.tela1),
    selectedVariante.tela2 ? telaDescripcion(selectedVariante.tela2) : undefined
  );

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
        <div
          className={`aspect-square bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center relative overflow-hidden`}
        >
          <div className="text-center">
            <Sparkles className="h-16 w-16 mx-auto text-foreground/10 mb-2" />
            <span className="text-7xl font-titles text-foreground/10">
              {model.nombre.charAt(0)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {model.tipo}
            {model.detalle ? ` · ${model.detalle}` : ''}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold font-titles mb-4">{model.nombre}</h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{model.descripcion}</p>

          {/* Variant Selector */}
          <div className="mb-8">
            <VariantSelector
              variantes={model.variantes}
              selected={selectedVariante}
              onSelect={setSelectedVariante}
            />
          </div>

          {/* Actions */}
          <div className="space-y-3 mt-auto">
            <AddToCartButton model={model} variante={selectedVariante} />
            <Button asChild variant="outline" className="w-full gap-2" size="lg">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
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
