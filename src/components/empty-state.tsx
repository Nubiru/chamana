import { ThreadLineDecorative } from '@/components/graphics/ThreadLine';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No hay datos disponibles',
  description = 'No se encontraron registros para mostrar.',
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed animate-fade-in', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Decorative thread line - subtle background element */}
        <div className="absolute top-4 right-4 opacity-20">
          <ThreadLineDecorative variant="subtle" />
        </div>
        {icon && <div className="mb-4 text-muted-foreground relative z-10">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2 relative z-10">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm relative z-10">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
