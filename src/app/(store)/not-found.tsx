import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-titles)', color: '#223030' }}
        >
          Pagina no encontrada
        </h2>
        <p className="text-[#959D90] mb-8">La pagina que buscas no existe o fue movida.</p>
        <Link
          href="/tienda"
          className="inline-block px-6 py-3 bg-[#223030] text-[#EFEFE9] rounded-lg hover:bg-[#523D35] transition-colors"
        >
          Ir a la tienda
        </Link>
      </div>
    </div>
  );
}
