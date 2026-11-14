import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  RotateCw,
  Scissors,
} from 'lucide-react';
import { RACK_BLOUSES, formatINR, type RackBlouse } from '../data/storeData';
import { cn } from '../lib/cn';
import { PillCta } from './ui';

interface RackCarouselSectionProps {
  onAddBlouse: (blouse: RackBlouse, size: number) => void;
}

const CATEGORIES = ['All', 'Bridal Velvet', 'Raw Silk', 'Banarasi Zari'] as const;

export function RackCarouselSection({ onAddBlouse }: RackCarouselSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [hoveredIndex, setHoveredIndex] = useState<number>(2); // Default middle item faced
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'FRONT' | 'BACK'>('FRONT');
  const [selectedSize, setSelectedSize] = useState<number>(36);
  const [justAdded, setJustAdded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(1100);

  const filteredRack = useMemo(() => {
    return selectedCategory === 'All'
      ? RACK_BLOUSES
      : RACK_BLOUSES.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const N = filteredRack.length;
  const safeHov = Math.max(-1, Math.min(hoveredIndex, N - 1));
  const activeBlouse = openedIndex !== null ? filteredRack[openedIndex] : null;

  // Measure container for exact responsive spacing across Mac, iPad, and Phone
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setStageWidth(el.getBoundingClientRect().width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function handleCategoryChange(cat: (typeof CATEGORIES)[number]) {
    setSelectedCategory(cat);
    setHoveredIndex(0);
    setOpenedIndex(null);
    setViewMode('FRONT');
  }

  function handleAdd(blouse: RackBlouse) {
    onAddBlouse(blouse, selectedSize);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  const openBlouse = useCallback((idx: number) => {
    setOpenedIndex(idx);
    setViewMode('FRONT');
  }, []);

  const closeBlouse = useCallback(() => {
    setOpenedIndex(null);
    setViewMode('FRONT');
  }, []);

  const stepModal = useCallback(
    (direction: -1 | 1) => {
      if (openedIndex === null) return;
      const nextIdx = (openedIndex + direction + N) % N;
      setOpenedIndex(nextIdx);
      setHoveredIndex(nextIdx);
      setViewMode('FRONT');
    },
    [openedIndex, N],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (openedIndex !== null) {
        if (e.key === 'Escape') closeBlouse();
        else if (e.key === 'ArrowRight') stepModal(1);
        else if (e.key === 'ArrowLeft') stepModal(-1);
      } else {
        if (e.key === 'ArrowRight') {
          setHoveredIndex((prev) => Math.min(N - 1, prev < 0 ? 0 : prev + 1));
        } else if (e.key === 'ArrowLeft') {
          setHoveredIndex((prev) => Math.max(0, prev < 0 ? N - 1 : prev - 1));
        } else if (e.key === 'Enter' && safeHov >= 0) {
          openBlouse(safeHov);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openedIndex, safeHov, N, closeBlouse, stepModal, openBlouse]);

  // Responsive geometry calculations
  const isMobile = stageWidth < 640;
  const isTablet = stageWidth >= 640 && stageWidth < 1024;
  const isMacWide = stageWidth >= 1280;

  // Compute exact equal slot widths and symmetric gap parting
  const slotWidth = isMobile
    ? Math.max(58, Math.min(76, (stageWidth - 40) / Math.max(N, 5)))
    : isTablet
      ? 110
      : isMacWide
        ? 156
        : 132;

  const gapPush = isMobile ? 42 : isTablet ? 68 : isMacWide ? 96 : 82;
  const centerX = stageWidth / 2;

  // Garment horizontal coordinates
  const garmentPositions = useMemo(() => {
    return filteredRack.map((_, k) => {
      const baseOffset = (k - (N - 1) / 2) * slotWidth;
      let push = 0;
      if (safeHov >= 0 && k !== safeHov) {
        push = k < safeHov ? -gapPush : gapPush;
      }
      return centerX + baseOffset + push;
    });
  }, [filteredRack, N, slotWidth, safeHov, gapPush, centerX]);

  const facedX = safeHov >= 0 ? garmentPositions[safeHov] : centerX;
  const facedBlouse = safeHov >= 0 ? filteredRack[safeHov] : null;

  return (
    <section
      id="rack"
      aria-label="Signature Bridal Blouse Rack"
      className="relative overflow-hidden border-y border-neutral-100 bg-linear-to-b from-neutral-50/70 via-white to-neutral-50/40 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B1E2B]">
            Suspended Atelier Rail • Custom Fitted Cholis
          </p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Inspect the <span className="text-[#8B1E2B]">Blouse Rack.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-neutral-600 sm:text-base">
            Suspended from our Patna showroom beam. Garments hang edge-on along the polished rail. Hover, tap, or swipe to rotate any choli forward and inspect handcrafted dori, velvet zardozi, and raw silk tailoring.
          </p>

          {/* Fabric Filter Pills */}
          <div
            role="group"
            aria-label="Filter blouse rack by fabric"
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]',
                    active
                      ? 'bg-[#8B1E2B] text-white shadow-xs'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:border-[#8B1E2B] hover:text-[#8B1E2B]',
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- SUSPENDED 3D CLOTHING RAIL STAGE ---------------- */}
        <div
          ref={containerRef}
          onPointerLeave={() => {
            if (openedIndex === null) setHoveredIndex(-1);
          }}
          className="relative mt-12 h-[410px] w-full select-none sm:h-[470px] lg:h-[500px]"
        >
          {/* Ceiling Suspension Rods (Visibly shows the rail is hung in the atelier) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24">
            {/* Left Ceiling Mount Flange & Drop Rod */}
            <div className="absolute left-[20%] top-0 flex flex-col items-center">
              <div className="h-2 w-8 rounded-t-sm bg-neutral-400 shadow-sm" />
              <div
                className="h-20 w-2.5 shadow-sm"
                style={{
                  background:
                    'linear-gradient(to right, #9ca3af 0%, #f3f4f6 45%, #6b7280 100%)',
                }}
              />
              <div className="size-4 rounded-full border border-neutral-400 bg-neutral-200 shadow-xs" />
            </div>

            {/* Right Ceiling Mount Flange & Drop Rod */}
            <div className="absolute right-[20%] top-0 flex flex-col items-center">
              <div className="h-2 w-8 rounded-t-sm bg-neutral-400 shadow-sm" />
              <div
                className="h-20 w-2.5 shadow-sm"
                style={{
                  background:
                    'linear-gradient(to right, #9ca3af 0%, #f3f4f6 45%, #6b7280 100%)',
                }}
              />
              <div className="size-4 rounded-full border border-neutral-400 bg-neutral-200 shadow-xs" />
            </div>
          </div>

          {/* Polished Chrome Clothing Rail Tube */}
          <div className="pointer-events-none absolute inset-x-4 top-[84px] z-10 sm:inset-x-12 lg:inset-x-16">
            {/* Left Polished End-Cap */}
            <div
              className="absolute -left-3.5 -top-2.5 h-8 w-4 rounded-md shadow-md"
              style={{
                background:
                  'linear-gradient(90deg, #8d9096 0%, #f3f3f4 45%, #7a7d83 100%)',
              }}
            />

            {/* Polished Chrome Cylinder Tube */}
            <div
              className="h-3 w-full rounded-full shadow-[0_12px_20px_rgba(0,0,0,0.22)]"
              style={{
                background:
                  'linear-gradient(to bottom, #ffffff 0%, #cfd2d6 24%, #4b5563 52%, #9ca3af 75%, #f3f4f6 100%)',
              }}
            />

            {/* Right Polished End-Cap */}
            <div
              className="absolute -right-3.5 -top-2.5 h-8 w-4 rounded-md shadow-md"
              style={{
                background:
                  'linear-gradient(90deg, #8d9096 0%, #f3f3f4 45%, #7a7d83 100%)',
              }}
            />
          </div>

          {/* Soft Floor Ambient Drop Shadow Beneath the Rail */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 bottom-12 h-28 bg-linear-to-t from-neutral-900/6 to-transparent blur-xl"
          />

          {/* The Garments: Hung with Hooks Precisely Over the Rail at Identical Vertical Baseline */}
          <div className="absolute inset-0">
            {filteredRack.map((blouse, k) => {
              const isFaced = safeHov === k;
              const posX = garmentPositions[k];
              const isHiddenOnRail = openedIndex === k;

              return (
                <div
                  key={blouse.id}
                  onPointerEnter={() => {
                    if (openedIndex === null) setHoveredIndex(k);
                  }}
                  onClick={() => openBlouse(k)}
                  aria-label={`${blouse.name} — Click to inspect details`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openBlouse(k);
                    }
                  }}
                  style={{
                    left: `${posX}px`,
                    top: '72px', // Hook top sits exactly 12px above rail tube (y=84), wrapping over it
                    visibility: isHiddenOnRail ? 'hidden' : 'visible',
                    transition:
                      'left 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                  className={cn(
                    'group/garment absolute -ml-28 w-56 sm:-ml-32 sm:w-64 cursor-pointer will-change-transform focus-visible:outline-2 focus-visible:outline-[#8B1E2B]',
                    isFaced ? 'z-30' : 'z-20',
                  )}
                >
                  {/* 3D Pivot: Pinned exactly at hook loop (50% X, 3.5% Y) */}
                  <div
                    style={{
                      perspective: '900px',
                      transformOrigin: '50% 3.5%',
                    }}
                    className="relative flex h-[310px] sm:h-[350px] lg:h-[370px] w-full items-start justify-center"
                  >
                    <div
                      style={{
                        transformOrigin: '50% 3.5%',
                        transform: isFaced
                          ? 'rotateY(0deg) scale(1.08) translateY(-2px)'
                          : 'rotateY(-72deg) rotateZ(-1deg)',
                        filter: isFaced
                          ? 'brightness(1) drop-shadow(0 22px 28px rgba(139,30,43,0.22))'
                          : 'brightness(0.82) drop-shadow(0 14px 14px rgba(0,0,0,0.35))',
                        transition:
                          'transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease',
                      }}
                      className="relative h-full w-full will-change-transform"
                    >
                      {/* Top-aligned image so hook tips align identically across all garments */}
                      <img
                        src={blouse.image}
                        alt={blouse.name}
                        draggable={false}
                        style={{
                          objectFit: 'contain',
                          objectPosition: '50% 0%',
                        }}
                        className="size-full select-none drop-shadow-sm"
                      />

                      {/* Floating prompt badge on faced blouse */}
                      {isFaced && (
                        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900/90 px-3.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-lg backdrop-blur-xs transition-opacity duration-300">
                          TAP TO INSPECT FITTING
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gliding Floating Caption under Faced Garment */}
          <div
            style={{
              left: `${facedX}px`,
              opacity: facedBlouse && openedIndex === null ? 1 : 0,
              transform: 'translateX(-50%)',
              transition:
                'left 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
            }}
            className="pointer-events-none absolute bottom-3 flex flex-col items-center text-center whitespace-nowrap"
          >
            {facedBlouse && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 sm:text-sm">
                  {facedBlouse.name}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-500">
                  {facedBlouse.fabric} •{' '}
                  <span className="font-bold text-[#8B1E2B]">
                    {formatINR(facedBlouse.price)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stepper Chevrons Below Rail */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setHoveredIndex((h) => Math.max(0, h - 1))}
            aria-label="Previous blouse on rail"
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-bold tabular-nums text-neutral-500">
            {safeHov >= 0 ? `0${safeHov + 1} / 0${N}` : `— / 0${N}`}
          </span>
          <button
            type="button"
            onClick={() => setHoveredIndex((h) => Math.min(N - 1, h + 1))}
            aria-label="Next blouse on rail"
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ---------------- DETAIL VIEW MODAL (LIFT OFF THE RAIL) ---------------- */}
      <AnimatePresence>
        {activeBlouse && openedIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Backdrop wash-out with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={closeBlouse}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card (Lifts smoothly into focus) */}
            <motion.div
              initial={{ scale: 0.72, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-label={activeBlouse.name}
              className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 md:flex-row md:items-center md:gap-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeBlouse}
                aria-label="Close blouse details"
                className="absolute right-5 top-5 z-20 flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X className="size-5" />
              </button>

              {/* Left: 3D FRONT/BACK Flip Showcase */}
              <div className="relative flex flex-1 flex-col items-center justify-center py-4">
                <div
                  style={{ perspective: 1000 }}
                  className="relative h-72 w-64 sm:h-88 sm:w-80"
                >
                  <motion.div
                    animate={{ rotateY: viewMode === 'BACK' ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    className="preserve-3d relative size-full"
                  >
                    {/* Front Face */}
                    <div className="backface-hidden absolute inset-0 flex items-center justify-center">
                      <img
                        src={activeBlouse.image}
                        alt={`${activeBlouse.name} front view`}
                        style={{ objectFit: 'contain', objectPosition: '50% 0%' }}
                        className="size-full drop-shadow-xl"
                      />
                    </div>

                    {/* Back Silhouette Face */}
                    <div
                      style={{ transform: 'rotateY(180deg)' }}
                      className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50/90 p-6 text-center shadow-md backdrop-blur-xs"
                    >
                      <Sparkles className="size-8 text-[#8B1E2B]" />
                      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#8B1E2B]">
                        Back Silhouette &amp; Dori Work
                      </p>
                      <p className="mt-2.5 text-xs font-medium leading-relaxed text-neutral-800 sm:text-sm">
                        {activeBlouse.backDetails}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                        <Scissors className="size-3.5 text-[#8B1E2B]" />
                        <span>Tailored in 48 hrs in Patna</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Front / Back Toggle Pill */}
                <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('FRONT')}
                    className={cn(
                      'rounded-full px-4 py-1 text-xs font-bold transition',
                      viewMode === 'FRONT'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950',
                    )}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('BACK')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold transition',
                      viewMode === 'BACK'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950',
                    )}
                  >
                    <RotateCw className="size-3 text-[#8B1E2B]" />
                    <span>Back &amp; Dori</span>
                  </button>
                </div>

                {/* Prev / Next Chevrons on Modal */}
                <div className="mt-4 flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => stepModal(-1)}
                    aria-label="Previous blouse"
                    className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs font-bold tabular-nums text-neutral-500">
                    0{openedIndex + 1} / 0{N}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepModal(1)}
                    aria-label="Next blouse"
                    className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Right: Tailoring Details, Size Selection & Bag CTA */}
              <div className="flex flex-1 flex-col justify-between border-t border-neutral-100 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#8B1E2B]/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8B1E2B]">
                      {activeBlouse.category}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      In-House Patna Loom
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-extrabold text-neutral-950 sm:text-2xl">
                    {activeBlouse.name}
                  </h3>
                  <p className="mt-1.5 text-lg font-black text-[#8B1E2B]">
                    {formatINR(activeBlouse.price)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
                    {activeBlouse.fabric}
                  </p>
                  <p className="mt-2 text-xs italic text-neutral-500">
                    {activeBlouse.craftNote}
                  </p>

                  {/* Size Selector */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        Select Bust Size (Inches)
                      </p>
                      <span className="text-[11px] text-neutral-500">
                        Alterations included
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeBlouse.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              'flex size-10 items-center justify-center rounded-xl border text-xs font-bold tabular-nums transition',
                              isSelected
                                ? 'border-[#8B1E2B] bg-[#8B1E2B] text-white shadow-xs'
                                : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-950',
                            )}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Add to Bag CTA */}
                <div className="mt-8 border-t border-neutral-100 pt-5">
                  <PillCta
                    label={
                      justAdded
                        ? `Saved Size ${selectedSize} to Bag!`
                        : `Add Size ${selectedSize} to Bag`
                    }
                    onClick={() => handleAdd(activeBlouse)}
                    className="w-full justify-center"
                  />
                  <p className="mt-2 text-center text-[11px] text-neutral-400">
                    Ready for trial &amp; pickup at Khetan Super Market, Patna
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
