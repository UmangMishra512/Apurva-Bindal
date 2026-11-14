import { MARQUEE_ITEMS } from '../data/storeData';

export function MarqueeTicker() {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      aria-label="Showroom highlights"
      className="relative flex w-full items-center overflow-hidden border-y border-[#E5B869]/30 bg-[#520D18] py-2.5 text-white"
    >
      <div className="pointer-events-none absolute left-3 z-10 flex size-7 items-center justify-center rounded-full border border-[#E5B869]/50 bg-neutral-950 text-[11px] font-extrabold text-[#F3D28B] shadow-md">
        A
      </div>

      <div className="animate-marquee flex w-max shrink-0 items-center gap-8 pl-12 pr-8">
        {repeated.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex shrink-0 items-center gap-8">
            <span className="text-xs font-semibold text-white/95">{item}</span>
            <span className="text-[#E5B869]" aria-hidden="true">
              ◆
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
