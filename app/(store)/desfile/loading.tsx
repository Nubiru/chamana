export default function DesfileLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-10 w-48 bg-[#E8D9CD]/40 rounded animate-pulse mx-auto mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, never reordered
          <div key={i} className="aspect-square rounded-lg bg-[#E8D9CD]/40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
