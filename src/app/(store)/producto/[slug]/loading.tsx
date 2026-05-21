export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="aspect-[3/4] rounded-lg bg-[#E8D9CD]/40 animate-pulse" />
        {/* Details skeleton */}
        <div className="flex flex-col gap-4 py-4">
          <div className="h-8 w-3/4 bg-[#E8D9CD]/40 rounded animate-pulse" />
          <div className="h-5 w-1/3 bg-[#E8D9CD]/40 rounded animate-pulse" />
          <div className="h-4 w-full bg-[#E8D9CD]/40 rounded animate-pulse mt-4" />
          <div className="h-4 w-5/6 bg-[#E8D9CD]/40 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-[#E8D9CD]/40 rounded animate-pulse" />
          <div className="h-12 w-full bg-[#E8D9CD]/40 rounded animate-pulse mt-8" />
        </div>
      </div>
    </div>
  );
}
