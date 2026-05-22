export default function ColeccionesLoading() {
  return (
    <div className="container py-8 px-4">
      <div className="h-9 w-48 bg-muted/30 animate-pulse rounded mb-3" />
      <div className="h-4 w-72 bg-muted/30 animate-pulse rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {['sk-1', 'sk-2', 'sk-3'].map((id) => (
          <div key={id} className="bg-muted/30 animate-pulse rounded-lg aspect-[4/3]" />
        ))}
      </div>
    </div>
  );
}
