export default function ColeccionLoading() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-3xl mb-8">
        <div className="h-9 w-2/3 bg-muted/30 animate-pulse rounded mb-3" />
        <div className="h-4 w-1/4 bg-muted/30 animate-pulse rounded mb-4" />
        <div className="h-4 w-full bg-muted/30 animate-pulse rounded mb-2" />
        <div className="h-4 w-5/6 bg-muted/30 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {['sk-1', 'sk-2', 'sk-3', 'sk-4'].map((id) => (
          <div key={id} className="bg-muted/30 animate-pulse rounded-lg aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}
