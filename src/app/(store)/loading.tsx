export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#959D90] border-t-[#223030] animate-spin" />
        <p className="text-[#959D90] text-sm tracking-widest uppercase">Cargando...</p>
      </div>
    </div>
  );
}
