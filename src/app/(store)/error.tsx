'use client';

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js error boundary convention
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-titles)', color: '#223030' }}
        >
          Algo salio mal
        </h2>
        <p className="text-[#959D90] mb-8">
          Ocurrio un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-[#223030] text-[#EFEFE9] rounded-lg hover:bg-[#523D35] transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
