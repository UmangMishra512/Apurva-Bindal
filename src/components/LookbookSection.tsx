import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
} from 'lucide-react';
import {
  LOOKBOOK_ITEMS,
  formatINR,
  type BundlePiece,
  type LookbookEntry,
} from '../data/storeData';
import { cn } from '../lib/cn';
import { PillCta, TwoToneHeading } from './ui';

interface LookbookSectionProps {
  onAddPiece: (piece: BundlePiece, lookTitle: string) => void;
  onAddFullLook: (look: LookbookEntry) => void;
}

// Spring physics constants matching critically damped Runway simulation
const SPRING_K = 95;
const SPRING_C = 2 * Math.sqrt(SPRING_K); // ~19.49: arrives smoothly, zero bounce
const AUTOPLAY_MS = 5000;
const CLONE_MULTIPLIER = 2; // 5 looks * 2 = 10 ring slots for seamless 360 loop

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function LookbookSection({ onAddPiece, onAddFullLook }: LookbookSectionProps) {
  const n = LOOKBOOK_ITEMS.length; // 5 looks
  const N = n * CLONE_MULTIPLIER; // 10 ring bodies
  const stepAngle = (2 * Math.PI) / N;

  const stageRef = useRef<HTMLDivElement>(null);
  const modelsContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Discrete active index (0..4)
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePieceId, setActivePieceId] = useState<string | null>(
    LOOKBOOK_ITEMS[0].pieces[0]?.id ?? null,
  );
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHoveredOnPanel, setIsHoveredOnPanel] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Physics animation refs (bypass React state for 60fps transform loop)
  const animRef = useRef({
    cur: 0,
    target: 0,
    vel: 0,
    raf: 0 as number | null,
    lastTime: 0,
    W: 900,
    H: 600,
    isDragging: false,
    dragStart: { x: 0, y: 0, target: 0, time: 0 },
    dragSamples: [] as { x: number; time: number }[],
    wheelDebounceTimer: null as ReturnType<typeof setTimeout> | null,
    resumeTimer: null as ReturnType<typeof setTimeout> | null,
    cursor: { x: 0, y: 0, targetX: 0, targetY: 0, visible: false, isDragging: false, isLink: false, raf: 0 as number | null },
  });

  const activeLook = LOOKBOOK_ITEMS[activeIndex];
  const rawTotal = activeLook.pieces.reduce((sum, piece) => sum + piece.price, 0);
  const bundleTotal = Math.round(rawTotal * 0.9);

  // Trigger cinematic light sweep whenever active index shifts
  useEffect(() => {
    setSweepKey((k) => k + 1);
  }, [activeIndex]);

  // 10 body descriptors on the 3D ring
  const bodies = useMemo(() => {
    return Array.from({ length: N }, (_, a) => ({
      a,
      lookIndex: a % n,
      look: LOOKBOOK_ITEMS[a % n],
    }));
  }, [N, n]);

  // Position all 3D bodies on the ring for current angle `cur`
  const updateStageBodies = useCallback((cur: number, W: number, H: number) => {
    const container = modelsContainerRef.current;
    if (!container) return;

    const isMobile = W < 640;
    const isTablet = W >= 640 && W < 1024;
    const R = W * (isMobile ? 0.72 : isTablet ? 0.62 : 0.56);
    const P = W * (isMobile ? 1.85 : isTablet ? 1.65 : 1.55);
    const fs = isMobile ? 1.05 : 1.08;
    const cx = W * 0.5;
    const floorMargin = isMobile ? 28 : 40;
    const floor = H - floorMargin;
    const horizon = H * 0.38;

    const modelElements = container.children;
    for (let i = 0; i < N && i < modelElements.length; i++) {
      const el = modelElements[i] as HTMLElement;
      const a = i;

      let phi = ((a - cur) * stepAngle) % (2 * Math.PI);
      if (phi > Math.PI) phi -= 2 * Math.PI;
      if (phi < -Math.PI) phi += 2 * Math.PI;

      const z = R * (1 - Math.cos(phi));
      const sl = Math.abs(phi) / stepAngle;
      const p = (P / (P + z)) * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
      const x = cx + R * Math.sin(phi) * (P / (P + z));
      const feet = horizon + (floor - horizon) * (P / (P + z));
      const bottom = H - feet;

      // Dynamic depth-of-field blur: soft beside front, stronger behind
      let blur = 0;
      if (sl > 0.18) {
        blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
      }

      // Smooth opacity falloff toward rear of the 3D ring
      const opacity = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
      const isFront = sl < 0.22;

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(-bottom).toFixed(2)}px, 0) translateX(-50%) scale(${p.toFixed(4)})`;
      el.style.zIndex = String(Math.round(p * 1000));
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
      el.style.visibility = opacity < 0.02 ? 'hidden' : 'visible';
      el.style.pointerEvents = opacity < 0.4 ? 'none' : 'auto';

      // Toggle hotspot pins on front model
      const pinsEl = el.querySelector<HTMLElement>('[data-rw-pins]');
      if (pinsEl) {
        pinsEl.style.opacity = isFront ? '1' : '0';
        pinsEl.style.pointerEvents = isFront ? 'auto' : 'none';
      }
    }
  }, [N, stepAngle]);

  // Main physics loop (critically damped spring)
  const kickSimulation = useCallback(() => {
    const anim = animRef.current;
    if (anim.raf) return;

    const step = (now: number) => {
      const dt = anim.lastTime ? Math.min(0.034, (now - anim.lastTime) / 1000) : 1 / 60;
      anim.lastTime = now;

      const subSteps = 3;
      const h = dt / subSteps;

      for (let j = 0; j < subSteps; j++) {
        const acc = -SPRING_K * (anim.cur - anim.target) - SPRING_C * anim.vel;
        anim.vel += acc * h;
        anim.cur += anim.vel * h;
      }

      const diff = Math.abs(anim.cur - anim.target);
      const moving = diff > 0.0005 || Math.abs(anim.vel) > 0.0005 || anim.isDragging;

      if (!moving) {
        anim.cur = anim.target;
        anim.vel = 0;
      }

      updateStageBodies(anim.cur, anim.W, anim.H);

      // Sync active discrete index
      const normalizedIndex = ((Math.round(anim.cur) % n) + n) % n;
      setActiveIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

      if (moving) {
        anim.raf = requestAnimationFrame(step);
      } else {
        anim.raf = null;
      }
    };

    anim.raf = requestAnimationFrame(step);
  }, [n, updateStageBodies]);

  // Navigate to target look with shortest angular loop direction
  const goToLook = useCallback((targetLookIndex: number) => {
    const anim = animRef.current;
    const currentDiscrete = ((Math.round(anim.target) % n) + n) % n;
    let delta = targetLookIndex - currentDiscrete;
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;

    anim.target = Math.round(anim.target) + delta;
    kickSimulation();
  }, [n, kickSimulation]);

  const goNext = useCallback(() => {
    const anim = animRef.current;
    anim.target = Math.round(anim.target) + 1;
    kickSimulation();
  }, [kickSimulation]);

  const goPrev = useCallback(() => {
    const anim = animRef.current;
    anim.target = Math.round(anim.target) - 1;
    kickSimulation();
  }, [kickSimulation]);

  // Responsive stage measurement and headroom calculation
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      animRef.current.W = W;
      animRef.current.H = H;

      const isMobile = W < 640;
      const fs = isMobile ? 1.05 : 1.08;
      const floorMargin = isMobile ? 28 : 40;
      // Guarantee at least 68px (desktop) / 52px (mobile) headroom from top of stage
      const topHeadroom = isMobile ? 52 : 68;
      const calculatedModelH = Math.max(220, Math.round((H - floorMargin - topHeadroom) / fs));

      stage.style.setProperty('--rw-model-h', `${calculatedModelH}px`);
      updateStageBodies(animRef.current.cur, W, H);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [updateStageBodies]);

  // Autoplay timer with 5000ms duration
  useEffect(() => {
    if (!isPlaying || isHoveredOnPanel || isInteracting || isZoomed) return;

    const timer = setInterval(() => {
      goNext();
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHoveredOnPanel, isInteracting, isZoomed, goNext]);

  // ---------------- TWO-FINGER TRACKPAD & MOBILE TOUCH GESTURE SCRUBBING ----------------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const anim = animRef.current;

    // 1. MacBook Trackpad Two-Finger Continuous Scrubbing
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); // Stop browser back/forward swipe navigation

        setIsInteracting(true);
        if (anim.resumeTimer) clearTimeout(anim.resumeTimer);
        if (anim.wheelDebounceTimer) clearTimeout(anim.wheelDebounceTimer);

        // Continuous scrub: 1px of horizontal delta rotates smoothly
        const unit = Math.max(140, anim.W * 0.32);
        anim.target += (e.deltaX / unit) * 0.45;
        kickSimulation();

        // Snap to nearest integer look when two-finger trackpad swipe settles
        anim.wheelDebounceTimer = setTimeout(() => {
          anim.target = Math.round(anim.target);
          kickSimulation();

          anim.resumeTimer = setTimeout(() => {
            setIsInteracting(false);
          }, 3500);
        }, 120);
      }
    };

    // 2. Mobile Touch Swipe Rotation (iOS Safari & Android)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTarget = 0;
    let touchSamples: { x: number; time: number }[] = [];
    let isTouchActive = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTarget = anim.target;
      touchSamples = [{ x: t.clientX, time: performance.now() }];
      isTouchActive = false;

      setIsInteracting(true);
      if (anim.resumeTimer) clearTimeout(anim.resumeTimer);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      if (!isTouchActive) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
          isTouchActive = true;
        } else if (Math.abs(dy) > 8) {
          return; // Let user vertically scroll page
        } else {
          return;
        }
      }

      if (isTouchActive) {
        e.preventDefault(); // Prevent page bouncing while rotating saree
        touchSamples.push({ x: t.clientX, time: performance.now() });
        if (touchSamples.length > 5) touchSamples.shift();

        const unit = Math.max(110, anim.W * 0.34);
        anim.target = touchStartTarget - dx / unit;
        kickSimulation();
      }
    };

    const handleTouchEnd = () => {
      if (!isTouchActive) {
        setIsInteracting(false);
        return;
      }
      isTouchActive = false;

      // Inertia fling momentum on touch release
      if (touchSamples.length >= 2) {
        const first = touchSamples[0];
        const last = touchSamples[touchSamples.length - 1];
        const dt = (last.time - first.time) / 1000;
        if (dt > 0.01) {
          const vx = (last.x - first.x) / dt;
          const unit = Math.max(110, anim.W * 0.34);
          const impulse = (vx / unit) * 0.16;
          anim.target -= clamp(impulse, -1.8, 1.8);
        }
      }

      anim.target = Math.round(anim.target);
      kickSimulation();

      anim.resumeTimer = setTimeout(() => {
        setIsInteracting(false);
      }, 4000);
    };

    // Attach non-passive listeners for smooth gesture prevention
    stage.addEventListener('wheel', handleWheel, { passive: false });
    stage.addEventListener('touchstart', handleTouchStart, { passive: true });
    stage.addEventListener('touchmove', handleTouchMove, { passive: false });
    stage.addEventListener('touchend', handleTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      stage.removeEventListener('wheel', handleWheel);
      stage.removeEventListener('touchstart', handleTouchStart);
      stage.removeEventListener('touchmove', handleTouchMove);
      stage.removeEventListener('touchend', handleTouchEnd);
      stage.removeEventListener('touchcancel', handleTouchEnd);
      if (anim.wheelDebounceTimer) clearTimeout(anim.wheelDebounceTimer);
      if (anim.resumeTimer) clearTimeout(anim.resumeTimer);
    };
  }, [kickSimulation]);

  // ---------------- LUXURY DYNAMIC LERP CURSOR (DESKTOP) ----------------
  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return;

    const anim = animRef.current;
    let rafId: number | null = null;

    const renderCursor = () => {
      const c = anim.cursor;
      const lerp = 0.2;
      c.x += (c.targetX - c.x) * lerp;
      c.y += (c.targetY - c.y) * lerp;

      cursor.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;

      if (Math.abs(c.targetX - c.x) + Math.abs(c.targetY - c.y) > 0.1) {
        rafId = requestAnimationFrame(renderCursor);
      } else {
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = stage.getBoundingClientRect();
      anim.cursor.targetX = e.clientX - rect.left;
      anim.cursor.targetY = e.clientY - rect.top;

      if (!anim.cursor.visible) {
        anim.cursor.x = anim.cursor.targetX;
        anim.cursor.y = anim.cursor.targetY;
        anim.cursor.visible = true;
        cursor.classList.add('opacity-100');
        cursor.classList.remove('opacity-0');
      }

      // Check if hovering over interactive hotspots or links
      const isTargetLink = !!(e.target as HTMLElement)?.closest('button, a, [data-rw-pins]');
      if (isTargetLink !== anim.cursor.isLink) {
        anim.cursor.isLink = isTargetLink;
        if (isTargetLink) {
          cursor.classList.add('scale-25', 'bg-[#8B1E2B]', 'text-transparent', 'border-transparent');
        } else if (!anim.isDragging) {
          cursor.classList.remove('scale-25', 'bg-[#8B1E2B]', 'text-transparent', 'border-transparent');
        }
      }

      if (!rafId) {
        rafId = requestAnimationFrame(renderCursor);
      }
    };

    const handlePointerLeave = () => {
      anim.cursor.visible = false;
      cursor.classList.remove('opacity-100');
      cursor.classList.add('opacity-0');
    };

    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Pointer drag gestures for Desktop Mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const anim = animRef.current;
    anim.dragStart = {
      x: e.clientX,
      y: e.clientY,
      target: anim.target,
      time: e.timeStamp,
    };
    anim.dragSamples = [{ x: e.clientX, time: e.timeStamp }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const anim = animRef.current;
    if (!anim.dragStart.time) return;

    const dx = e.clientX - anim.dragStart.x;
    const dy = e.clientY - anim.dragStart.y;

    if (!anim.isDragging) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        anim.isDragging = true;
        setIsInteracting(true);
        if (cursorRef.current) {
          cursorRef.current.classList.add('scale-75', 'bg-[#8B1E2B]', 'text-white', 'border-transparent', 'tracking-[0.38em]');
        }
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (_) {}
      } else if (Math.abs(dy) > 12) {
        anim.dragStart.time = 0;
        return;
      } else {
        return;
      }
    }

    anim.dragSamples.push({ x: e.clientX, time: e.timeStamp });
    if (anim.dragSamples.length > 6) anim.dragSamples.shift();

    const unit = Math.max(120, anim.W * 0.3);
    anim.target = anim.dragStart.target - dx / unit;
    kickSimulation();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const anim = animRef.current;
    if (!anim.dragStart.time) return;
    const wasDragging = anim.isDragging;
    anim.dragStart.time = 0;
    anim.isDragging = false;

    if (cursorRef.current) {
      cursorRef.current.classList.remove('scale-75', 'bg-[#8B1E2B]', 'text-white', 'border-transparent', 'tracking-[0.38em]');
    }

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (!wasDragging) {
      setIsInteracting(false);
      return;
    }

    const samples = anim.dragSamples;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.01) {
        const vx = (last.x - first.x) / dt;
        const unit = Math.max(120, anim.W * 0.3);
        const impulse = (vx / unit) * 0.18;
        anim.target -= clamp(impulse, -1.8, 1.8);
      }
    }

    anim.target = Math.round(anim.target);
    kickSimulation();

    setTimeout(() => {
      setIsInteracting(false);
    }, 3500);
  };

  function markAdded(id: string) {
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    window.setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 1400);
  }

  // Keyboard escape listener to close zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  return (
    <section
      id="lookbook"
      className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 py-14 sm:px-8 sm:py-20 lg:px-12 xl:px-16"
    >
      {/* ----------------- GRAND MONOLITHIC EXHIBITION PLATFORM ----------------- */}
      <div className="overflow-hidden rounded-[28px] border border-neutral-200/90 bg-white shadow-2xl ring-1 ring-neutral-950/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[660px] xl:min-h-[740px]">
          
          {/* ================ Left Column: 3D Cylindrical Runway Stage Pavilion ================ */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between bg-linear-to-b from-neutral-50/80 via-white to-neutral-50/50 p-6 sm:p-8 lg:p-9 relative">
            
            {/* Embedded Luxury Stage Head */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start border-b border-neutral-200/60 pb-5">
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="h-[1px] w-7 bg-[#8B1E2B]" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#8B1E2B]">
                    Patna Bridal Atelier • 3D 360° Runway
                  </p>
                </div>
                <TwoToneHeading lead="Try the" accent="Look." className="mt-1" />
                <p className="mt-1.5 text-pretty text-xs text-neutral-600 sm:text-sm">
                  Six royal silhouettes arranged in depth. Swipe with two fingers on your Mac trackpad, drag smoothly, or tap any pin to inspect handcrafted details.
                </p>
              </div>

              {/* Top Meta: Look Counter + Dynamic Animated Look Chip */}
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    aria-label={isPlaying ? 'Pause runway rotation' : 'Start runway rotation'}
                    className="rw-sheen-sweep flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-2xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="size-3 text-[#8B1E2B]" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3 text-[#8B1E2B]" />
                        <span>Auto-Turn</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsZoomed(true)}
                    aria-label="Isolate and inspect active bridal silhouette"
                    className="flex size-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-2xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
                  >
                    <Maximize2 className="size-3.5" />
                  </button>

                  <div className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-neutral-700">
                    0{activeIndex + 1} / 0{n}
                  </div>
                </div>

                {/* Animated Look Chip with expanding hairline */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                  <span className="h-[1px] w-5 bg-neutral-300" />
                  <span key={activeLook.id} className="animate-rw-name-in italic text-[#8B1E2B]">
                    {activeLook.title}
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Runway Stage Canvas */}
            <div
              ref={stageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              role="region"
              aria-roledescription="carousel"
              aria-label="3D Bridal Runway: drag with finger or swipe with two fingers on trackpad"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') goNext();
                if (e.key === 'ArrowLeft') goPrev();
              }}
              className="relative h-[480px] sm:h-[540px] md:h-[600px] lg:h-[640px] xl:h-[700px] w-full select-none overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing my-auto"
            >
              {/* Dynamic Interactive Lerp Cursor */}
              <div
                ref={cursorRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-40 -ml-10 -mt-10 flex size-20 items-center justify-center rounded-full border border-neutral-400/40 bg-white/70 text-[10px] font-bold tracking-[0.24em] text-neutral-900 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 select-none"
              >
                DRAG
              </div>

              {/* Stage Depth Lighting & Floor Reflection Overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-neutral-900/8 via-neutral-900/2 to-transparent"
              />

              {/* Breathing Radial Floor Spotlight */}
              <div
                aria-hidden="true"
                style={{ backgroundColor: activeLook.accentColor }}
                className="animate-rw-breathe pointer-events-none absolute bottom-[-10%] left-1/2 -translate-x-1/2 aspect-[2.4] w-[min(70%,720px)] rounded-full opacity-18 blur-3xl mix-blend-soft-light transition-colors duration-700"
              />

              {/* Cinematic Stage Light Sweep on Look Transition */}
              <div
                key={`sweep-${sweepKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden mix-blend-soft-light"
              >
                <div className="animate-rw-sweep absolute -top-1/4 -bottom-1/4 left-0 w-2/5 bg-linear-to-r from-transparent via-white/50 to-transparent" />
              </div>

              {/* Container for all 10 Ring Bodies */}
              <div ref={modelsContainerRef} className="absolute inset-0">
                {bodies.map((b) => {
                  const isCurrentActive = b.lookIndex === activeIndex;
                  return (
                    <div
                      key={`ring-body-${b.a}`}
                      className="absolute bottom-0 left-0 will-change-transform"
                      style={{
                        transformOrigin: '50% 100%',
                        width: 'clamp(280px, 30vw, 360px)',
                      }}
                    >
                      {/* Elliptical Ground Shadow under feet */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-1/2 h-5 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-radial from-neutral-950/30 via-neutral-950/10 to-transparent blur-[2px]"
                      />

                      {/* Saree Model Image Container (Guaranteed Headroom Clearance) */}
                      <div
                        style={{ height: 'var(--rw-model-h, 480px)' }}
                        className="relative flex w-full items-end justify-center"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentActive) {
                              setIsZoomed(true);
                            } else {
                              goToLook(b.lookIndex);
                            }
                          }}
                          aria-label={`Select look: ${b.look.title}`}
                          className="h-full w-full flex items-end justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]"
                        >
                          <img
                            src={b.look.image}
                            alt={b.look.title}
                            draggable={false}
                            className="h-full w-auto max-w-[130%] object-contain object-bottom drop-shadow-md select-none"
                          />
                        </button>

                        {/* Subtle Catwalk Runway Mirror Floor Reflection */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute left-0 top-full w-full opacity-15 overflow-hidden"
                          style={{
                            height: 'var(--rw-model-h, 480px)',
                            transform: 'scaleY(-1)',
                            maskImage: 'linear-gradient(to top, black 0%, transparent 22%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 22%)',
                          }}
                        >
                          <img
                            src={b.look.image}
                            alt=""
                            draggable={false}
                            className="h-full w-auto max-w-[130%] object-contain object-bottom select-none"
                          />
                        </div>

                        {/* Interactive Hotspot Pins with Dual Ripples & Gliding Frosted Tooltips */}
                        <div
                          data-rw-pins
                          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                          style={{ opacity: isCurrentActive ? 1 : 0 }}
                        >
                          {b.look.hotspots.map((pin, pIndex) => {
                            const isPinSelected = activePieceId === pin.pieceId;
                            return (
                              <div
                                key={pin.id}
                                style={{
                                  left: `${pin.xPercent}%`,
                                  top: `${pin.yPercent}%`,
                                }}
                                className="group/pin pointer-events-auto absolute z-30 -translate-x-1/2 -translate-y-1/2"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePieceId(pin.pieceId);
                                  }}
                                  onMouseEnter={() => setActivePieceId(pin.pieceId)}
                                  aria-label={`Inspect ${pin.label}`}
                                  style={{ animationDelay: `${pIndex * 90 + 150}ms` }}
                                  className="animate-rw-pin-in relative flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]"
                                >
                                  {/* Dual Continuous Staggered Ripple Rings */}
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      'animate-rw-ring pointer-events-none absolute inset-1 rounded-full border border-white/70',
                                      isPinSelected && 'border-[#8B1E2B]/80',
                                    )}
                                  />
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      'animate-rw-ring-delayed pointer-events-none absolute inset-1 rounded-full border border-white/50',
                                      isPinSelected && 'border-[#8B1E2B]/60',
                                    )}
                                  />

                                  {/* Core Pin Dot */}
                                  <span
                                    className={cn(
                                      'relative flex size-6 items-center justify-center rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md transition-all duration-300 group-hover/pin:scale-125',
                                      isPinSelected
                                        ? 'bg-[#8B1E2B] text-white ring-4 ring-[#8B1E2B]/25'
                                        : 'bg-white/90 text-neutral-900 border border-neutral-200/60 hover:bg-[#8B1E2B] hover:text-white',
                                    )}
                                  >
                                    {pIndex + 1}
                                  </span>
                                </button>

                                {/* Frosted Glass Tooltip Pill Gliding Out on Hover */}
                                <div
                                  className={cn(
                                    'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-xl backdrop-blur-md ring-1 ring-black/5 transition-all duration-300',
                                    isPinSelected
                                      ? 'opacity-100 translate-x-0'
                                      : 'opacity-0 -translate-x-2 group-hover/pin:opacity-100 group-hover/pin:translate-x-0',
                                  )}
                                >
                                  {pin.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Next / Prev Float Buttons on Stage */}
              <div className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous bridal look"
                  className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white/85 text-neutral-800 shadow-sm backdrop-blur-xs transition hover:scale-105 hover:border-[#8B1E2B] hover:text-[#8B1E2B] active:scale-95"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next bridal look"
                  className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white/85 text-neutral-800 shadow-sm backdrop-blur-xs transition hover:scale-105 hover:border-[#8B1E2B] hover:text-[#8B1E2B] active:scale-95"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Stage Floor Controls: Segmented 01–05 Progress Timeline */}
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-200/70 pt-4">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous look"
                className="group flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-2xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
              >
                <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                {LOOKBOOK_ITEMS.map((item, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToLook(idx)}
                      aria-current={isSelected ? 'true' : 'false'}
                      aria-label={`Look 0${idx + 1}: ${item.title}`}
                      className={cn(
                        'group flex h-11 flex-col justify-center gap-1.5 text-left transition-all duration-500 ease-out',
                        isSelected ? 'flex-[0_0_170px] sm:flex-[0_0_200px]' : 'flex-[0_1_48px] opacity-60 hover:opacity-100',
                      )}
                    >
                      {/* Animated Progress Bar */}
                      <div className="relative h-1 w-full overflow-hidden rounded-full bg-neutral-200 transition-transform group-hover:scale-y-125">
                        <div
                          className={cn(
                            'absolute inset-0 bg-[#8B1E2B] transition-transform',
                            isSelected
                              ? isPlaying && !isHoveredOnPanel && !isInteracting
                                ? 'animate-rw-fill'
                                : 'scale-x-100'
                              : idx < activeIndex
                                ? 'scale-x-100 opacity-40'
                                : 'scale-x-0',
                          )}
                        />
                      </div>
                      {/* Label & Title */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-800">
                        <span className="tabular-nums text-neutral-500">0{idx + 1}</span>
                        {isSelected && (
                          <span className="animate-rw-name-in truncate text-[#8B1E2B]">
                            {item.title.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next look"
                className="group flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-2xs transition hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
              >
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* ================ Right Column: Unified Ensemble & Pricing Suite ================ */}
          <div
            className="lg:col-span-5 xl:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-200/90 bg-[#FAF9F6]/90 flex flex-col justify-between p-6 sm:p-8"
            onMouseEnter={() => setIsHoveredOnPanel(true)}
            onMouseLeave={() => setIsHoveredOnPanel(false)}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-neutral-200/70 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B1E2B]">
                      In This Bridal Look
                    </p>
                    <span className="rounded-full bg-[#8B1E2B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8B1E2B]">
                      {activeLook.pieces.length} Pieces
                    </span>
                  </div>
                  <h3 className="mt-1 text-2xl font-bold font-editorial-serif text-neutral-950">
                    {activeLook.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">{activeLook.subtitle}</p>
                </div>
                <Sparkles className="size-5 shrink-0 text-[#8B1E2B]" aria-hidden="true" />
              </div>

              {/* Staggered Item List with Curtain & Media Deceleration */}
              <ul
                key={`items-${activeLook.id}`}
                className="mt-4 space-y-2.5 overflow-y-auto max-h-[350px] xl:max-h-[410px] pr-1.5 scrollbar-thin"
              >
                {activeLook.pieces.map((piece, pIdx) => {
                  const isDone = Boolean(addedIds[piece.id]);
                  const isHighlighted = activePieceId === piece.id;
                  return (
                    <li
                      key={piece.id}
                      onMouseEnter={() => setActivePieceId(piece.id)}
                      style={{ animationDelay: `${pIdx * 85 + 140}ms` }}
                      className={cn(
                        'animate-rw-item-in group relative flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition-all duration-300',
                        isHighlighted
                          ? 'border-[#8B1E2B]/30 bg-white ring-1 ring-[#8B1E2B]/40 translate-x-1 shadow-sm'
                          : 'border-transparent bg-white/60 hover:bg-white hover:border-neutral-200',
                      )}
                    >
                      {/* Sliding Hairline Accent Underline */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] bg-[#8B1E2B] origin-left transition-transform duration-500 ease-out',
                          isHighlighted ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                        )}
                      />

                      <div className="flex min-w-0 items-center gap-3">
                        {/* Thumbnail with Editorial Curtain Reveal */}
                        <div
                          style={{ animationDelay: `${pIdx * 85 + 200}ms` }}
                          className="animate-rw-curtain relative size-13 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1"
                        >
                          {/* Physical Hanging Thread Tag */}
                          {pIdx === 0 && (
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute left-1.5 top-0 z-10 flex flex-col items-start origin-[6px_0]"
                            >
                              <span className="ml-1.5 h-2 w-[1px] bg-neutral-800/40" />
                              <span className="animate-rw-swing origin-[6px_0] rounded-[2px] bg-neutral-900 px-1 py-0.5 text-[8px] font-black tracking-widest text-white uppercase shadow-xs">
                                Royal
                              </span>
                            </span>
                          )}

                          <img
                            src={piece.thumb}
                            alt={piece.name}
                            style={{ animationDelay: `${pIdx * 85 + 200}ms` }}
                            className="animate-rw-media-in size-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                          <span className="absolute bottom-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#8B1E2B] text-[9px] font-bold text-white shadow-2xs">
                            {pIdx + 1}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-[#8B1E2B]">
                            {piece.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {piece.category} •{' '}
                            <span className="font-semibold tabular-nums text-neutral-800">
                              {formatINR(piece.price)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Quick Add with Shockwave Burst Feedback */}
                      <button
                        type="button"
                        aria-label={`Add ${piece.name} to bag`}
                        onClick={() => {
                          onAddPiece(piece, activeLook.title);
                          markAdded(piece.id);
                        }}
                        className={cn(
                          'relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]',
                          isDone
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-[#8B1E2B] hover:bg-[#8B1E2B] hover:text-white hover:scale-105 active:scale-90',
                        )}
                      >
                        {isDone && (
                          <span
                            aria-hidden="true"
                            className="animate-rw-burst pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-500"
                          />
                        )}
                        {isDone ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <Plus className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Complete the Look Bundle Card with Specular Shine */}
            <div className="mt-4 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm ring-1 ring-neutral-950/5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    Complete the Look Bundle
                  </p>
                  <p className="text-xs font-semibold text-[#8B1E2B]">
                    Save 10% on full heirloom ensemble
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs tabular-nums text-neutral-400 line-through">
                    {formatINR(rawTotal)}
                  </p>
                  <p className="text-xl font-extrabold tabular-nums text-neutral-950">
                    {formatINR(bundleTotal)}
                  </p>
                </div>
              </div>

              <div className="rw-sheen-sweep mt-3.5 rounded-full">
                <PillCta
                  label={addedIds[activeLook.id] ? 'Bridal Bundle Saved' : 'Add Full Look to Bag'}
                  onClick={() => {
                    onAddFullLook(activeLook);
                    markAdded(activeLook.id);
                  }}
                  className="w-full justify-between"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- LOOK LIGHTBOX ZOOM MODAL (INSPECTION MODE) ---------------- */}
      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detailed View: ${activeLook.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative flex flex-col items-center justify-between rounded-3xl border border-white/20 bg-neutral-50/95 p-6 shadow-2xl max-w-4xl w-full h-[88vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between w-full border-b border-neutral-200 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2B]">
                  Patna Atelier Close-up Inspection
                </p>
                <h4 className="text-xl font-bold font-editorial-serif text-neutral-900">
                  {activeLook.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                aria-label="Close detailed inspection"
                className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-xs hover:border-[#8B1E2B] hover:text-[#8B1E2B]"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Model Cutout with Numbered Hotspot Pins */}
            <div className="relative flex-1 w-full flex items-center justify-center py-4 overflow-hidden">
              <div className="relative h-full max-h-[640px] aspect-[9/16]">
                <img
                  src={activeLook.image}
                  alt={activeLook.title}
                  className="size-full object-contain object-bottom drop-shadow-2xl"
                />

                {/* Hotspot Pins on Inspection View */}
                {activeLook.hotspots.map((pin, pIndex) => (
                  <button
                    key={`modal-pin-${pin.id}`}
                    type="button"
                    onClick={() => setActivePieceId(pin.pieceId)}
                    style={{
                      left: `${pin.xPercent}%`,
                      top: `${pin.yPercent}%`,
                    }}
                    className="group/mpin absolute z-30 -translate-x-1/2 -translate-y-1/2 flex items-center"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#8B1E2B] text-white text-xs font-bold shadow-lg ring-2 ring-white">
                      {pIndex + 1}
                    </span>
                    <span className="ml-2 whitespace-nowrap rounded-md bg-neutral-900/90 px-2.5 py-1 text-xs font-medium text-white shadow-md">
                      {pin.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Bottom Helper Bar */}
            <div className="w-full flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
              <span>Click outside or press Esc to return to runway</span>
              <span className="font-semibold text-neutral-800">
                {activeLook.pieces.length} ensemble pieces in look
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
