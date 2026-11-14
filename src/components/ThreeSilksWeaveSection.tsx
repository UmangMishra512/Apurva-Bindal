import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { WEAVE_SILK_OPTIONS, formatINR, type WeaveSilkOption } from '../data/storeData';
import { cn } from '../lib/cn';
import { PillCta, TwoToneHeading } from './ui';

interface ThreeSilksWeaveSectionProps {
  onAddWeaveBundle: (selected: WeaveSilkOption[], discountedPrice: number) => void;
}

export function ThreeSilksWeaveSection({ onAddWeaveBundle }: ThreeSilksWeaveSectionProps) {
  const [selectedIds, setSelectedIds] = useState<[string, string, string]>([
    WEAVE_SILK_OPTIONS[0].id,
    WEAVE_SILK_OPTIONS[1].id,
    WEAVE_SILK_OPTIONS[2].id,
  ]);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
  const [added, setAdded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedSilks: [WeaveSilkOption, WeaveSilkOption, WeaveSilkOption] = [
    WEAVE_SILK_OPTIONS.find((s) => s.id === selectedIds[0]) ?? WEAVE_SILK_OPTIONS[0],
    WEAVE_SILK_OPTIONS.find((s) => s.id === selectedIds[1]) ?? WEAVE_SILK_OPTIONS[1],
    WEAVE_SILK_OPTIONS.find((s) => s.id === selectedIds[2]) ?? WEAVE_SILK_OPTIONS[2],
  ];

  const rawTotal = selectedSilks.reduce((sum, item) => sum + item.price, 0);
  const discountedTotal = Math.round(rawTotal * 0.9);

  // Real-time 3D Z-Sorted Intertwined Silk Ribbon Helix Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let rafId = 0;
    let phaseOffset = 0;

    function renderFrame() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const ampY = Math.min(48, height * 0.25);
      const segments = 110;
      const stepX = width / segments;

      interface RibbonSlice {
        x: number;
        y: number;
        z: number;
        thickness: number;
        primary: string;
        zari: string;
        accent: string;
      }

      const slices: RibbonSlice[] = [];

      for (let i = 0; i <= segments; i++) {
        const x = i * stepX;
        const normX = i / segments;
        const angle = normX * Math.PI * 3.6 + phaseOffset;

        for (let r = 0; r < 3; r++) {
          const ribbonAngle = angle + (r * Math.PI * 2) / 3;
          const y = centerY + Math.sin(ribbonAngle) * ampY;
          const z = Math.cos(ribbonAngle); // -1 (back) to +1 (front)
          const silk = selectedSilks[r];
          const ribbonWidth = 22 + z * 8;

          slices.push({
            x,
            y,
            z,
            thickness: ribbonWidth,
            primary: silk.primaryHex,
            zari: silk.zariHex,
            accent: silk.accentHex,
          });
        }
      }

      // Painter's algorithm: draw farthest Z slices first so ribbons physically braid in 3D
      slices.sort((a, b) => a.z - b.z);

      for (const slice of slices) {
        const halfH = slice.thickness / 2;
        const shadeAlpha = 0.72 + (slice.z + 1) * 0.14;

        ctx.globalAlpha = Math.min(1, shadeAlpha);

        // Main silk body
        ctx.fillStyle = slice.primary;
        ctx.fillRect(slice.x - stepX * 0.65, slice.y - halfH, stepX * 1.4, slice.thickness);

        // Top & bottom metallic zari temple border edges
        ctx.fillStyle = slice.zari;
        ctx.fillRect(slice.x - stepX * 0.65, slice.y - halfH, stepX * 1.4, 2.6);
        ctx.fillRect(slice.x - stepX * 0.65, slice.y + halfH - 2.6, stepX * 1.4, 2.6);

        // Center subtle shadow / sheen fold
        ctx.fillStyle = slice.z > 0 ? 'rgba(255,255,255,0.16)' : slice.accent;
        ctx.fillRect(slice.x - stepX * 0.65, slice.y - 2, stepX * 1.4, 4);
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        phaseOffset -= 0.018;
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    renderFrame();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [selectedIds]);

  function assignSilkToActiveSlot(silkId: string) {
    setSelectedIds((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[activeSlot] = silkId;
      return next;
    });
    setActiveSlot((curr) => ((curr + 1) % 3) as 0 | 1 | 2);
  }

  function handleAddBundle() {
    onAddWeaveBundle(selectedSilks, discountedTotal);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  const romanLabels = ['I', 'II', 'III'] as const;

  return (
    <section
      id="weave"
      className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16"
    >
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1E2B]/20 bg-[#8B1E2B]/5 px-3.5 py-1 text-[11px] font-bold uppercase text-[#8B1E2B]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Any three silks, 10% off
        </span>
        <TwoToneHeading lead="Three silks," accent="one weave." className="mt-3" />
      </div>

      {/* 3D Intertwined Silk Ribbon Canvas */}
      <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-neutral-100 bg-neutral-50/70 py-4">
        <canvas
          ref={canvasRef}
          aria-label="Interactive 3D braided visualization of your three selected silks"
          className="h-44 w-full sm:h-52"
        />
      </div>

      {/* Configurator Controls */}
      <div className="mt-8 grid grid-cols-1 items-center gap-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs lg:grid-cols-12 lg:p-6">
        {/* Left: 3 Selected Trousseau Slots */}
        <div className="space-y-2 lg:col-span-4">
          {selectedSilks.map((silk, idx) => {
            const isSlotActive = activeSlot === idx;
            return (
              <button
                key={`${silk.id}-${idx}`}
                type="button"
                onClick={() => setActiveSlot(idx as 0 | 1 | 2)}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#8B1E2B]',
                  isSlotActive
                    ? 'border-[#8B1E2B] bg-[#8B1E2B]/5'
                    : 'border-neutral-200 bg-white hover:border-neutral-300',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
                    {romanLabels[idx]}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-neutral-950">{silk.name}</p>
                    <p className="text-[11px] text-neutral-500">{silk.origin}</p>
                  </div>
                </div>
                <span className="text-xs font-bold tabular-nums text-neutral-800">
                  {formatINR(silk.price)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center: Circular Fabric Swatch Selector */}
        <div className="flex flex-col items-center text-center lg:col-span-5">
          <p className="font-editorial-serif text-lg font-semibold italic text-neutral-800">
            Woven as one — tap to swap Slot {romanLabels[activeSlot]}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            {WEAVE_SILK_OPTIONS.map((swatch) => {
              const slotIndex = selectedIds.indexOf(swatch.id);
              const isSelected = slotIndex !== -1;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => assignSilkToActiveSlot(swatch.id)}
                  aria-label={`Select ${swatch.name}`}
                  style={{
                    backgroundColor: swatch.primaryHex,
                    borderColor: swatch.zariHex,
                  }}
                  className={cn(
                    'relative flex size-12 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]',
                    isSelected && 'ring-2 ring-neutral-950 ring-offset-2',
                  )}
                >
                  {isSelected && (
                    <span className="rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {romanLabels[slotIndex]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Discounted Trousseau Pricing & CTA */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-neutral-100 pt-4 lg:col-span-3 lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-xs font-medium tabular-nums text-neutral-400 line-through">
              {formatINR(rawTotal)}
            </p>
            <p className="text-3xl font-extrabold tabular-nums text-neutral-950">
              {formatINR(discountedTotal)}
            </p>
            <p className="text-xs font-semibold text-[#8B1E2B]">
              10% Trousseau Weave Savings
            </p>
          </div>

          <PillCta
            label={added ? 'Weave Added' : 'Add the weave to bag'}
            onClick={handleAddBundle}
            className="w-full justify-between lg:w-auto"
          />
          {added && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="size-3.5" aria-hidden="true" />
              3-silk bundle added
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
