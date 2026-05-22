import { Card, CardContent } from '@/components/ui/card';
import type { CollectionMeta } from '@/domain/catalog';
import { formatTemporada } from '@/lib/utils';
import Link from 'next/link';

export function ColeccionCard({ coleccion }: { coleccion: CollectionMeta }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-border/30 p-0">
      <Link href={`/colecciones/${coleccion.slug}`}>
        <div className="aspect-[4/3] earth-gradient relative overflow-hidden flex items-center justify-center">
          <span className="text-4xl md:text-5xl font-titles text-foreground/15 group-hover:text-foreground/25 transition-colors text-center px-4">
            {coleccion.nombre}
          </span>
        </div>

        <CardContent className="p-4">
          <h3 className="font-titles text-lg text-foreground group-hover:text-primary transition-colors">
            {coleccion.nombreCompleto}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {`${formatTemporada(coleccion.temporada)} ${coleccion.anio}`}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{coleccion.descripcion}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
