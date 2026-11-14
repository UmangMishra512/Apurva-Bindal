import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Plus, Check, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { BRIDAL_STORIES, formatINR, type BridalStoryItem } from '../data/storeData';
import { cn } from '../lib/cn';

interface BridalStoriesSectionProps {
  onAddStoryItem: (story: BridalStoryItem) => void;
}

const STORY_DURATION_MS = 5000;

export function BridalStoriesSection({ onAddStoryItem }: BridalStoriesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const count = BRIDAL_STORIES.length;
  const activeStory = BRIDAL_STORIES[activeIndex];
  const prevIndex = (activeIndex - 1 + count) % count;
  const nextIndex = (activeIndex + 1) % count;

  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION_MS) {
        setActiveIndex((curr) => (curr + 1) % count);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [activeIndex, isPaused, count]);

  function handleStep(delta: -1 | 1) {
    setActiveIndex((curr) => (curr + delta + count) % count);
  }

  function handleAdd(story: BridalStoryItem) {
    onAddStoryItem(story);
    setJustAddedId(story.id);
    window.setTimeout(() => setJustAddedId(null), 1200);
  }

  return (
    <section
      id="bridal-stories"
      aria-label="Bridal Stories Showcase"
      className="relative overflow-hidden bg-[#140407] py-20 text-white sm:py-28"
    >
      {/* Dynamic Ambient Radial Backdrop Glow Matching Active Garment */}
      <div
        aria-hidden="true"
        style={{ backgroundColor: activeStory.glowColor }}
        className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl transition-colors duration-700"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center">
          <p className="text-xs font-bold uppercase text-[#E5B869]">
            Bridal Reels &amp; Lookbooks
          </p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Bridal <span className="font-editorial-serif italic font-semibold text-[#E5B869]">Stories</span>
          </h2>
        </div>

        {/* 3D Spatial Stories Stage */}
        <div
          style={{ perspective: 1200 }}
          className="relative mt-12 flex items-center justify-center gap-4 sm:gap-8"
        >
          {/* Left Angled 3D Coverflow Story */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label={`Previous story: ${BRIDAL_STORIES[prevIndex].title}`}
            style={{
              transform: 'rotateY(22deg) scale(0.82)',
              backgroundColor: BRIDAL_STORIES[prevIndex].bgHex,
            }}
            className="hidden h-[410px] w-[230px] shrink-0 overflow-hidden rounded-3xl border border-white/10 opacity-55 shadow-2xl transition-opacity hover:opacity-85 md:block"
          >
            <img
              src={BRIDAL_STORIES[prevIndex].image}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 text-left">
              <p className="text-xs font-bold text-white">
                {BRIDAL_STORIES[prevIndex].title}
              </p>
            </div>
          </button>

          {/* Left Step Arrow */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Previous bridal story"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:hidden"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          {/* Center 9:16 Active Stories Player */}
          <div
            style={{ backgroundColor: activeStory.bgHex }}
            className="relative flex h-[500px] w-[290px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl sm:h-[540px] sm:w-[320px]"
          >
            {/* Multi-Segment Top Story Progress Bar */}
            <div className="relative z-20 px-4 pt-3.5">
              <div className="flex gap-1.5" aria-label="Story progress">
                {BRIDAL_STORIES.map((story, idx) => {
                  const widthPct =
                    idx < activeIndex ? 100 : idx === activeIndex ? progress : 0;
                  return (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Jump to story ${story.title}`}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                    >
                      <div
                        style={{ width: `${widthPct}%` }}
                        className="h-full rounded-full bg-white"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#E5B869] text-[11px] font-extrabold text-neutral-950">
                    A
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-none text-white">apurva.patna</p>
                    <p className="mt-0.5 text-[10px] text-white/70">{activeStory.collection}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    aria-label={isPaused ? 'Resume story playback' : 'Pause story playback'}
                    className="flex size-7 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55"
                  >
                    {isPaused ? (
                      <Play className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Pause className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    aria-label={isMuted ? 'Unmute story ambiance' : 'Mute story ambiance'}
                    className="flex size-7 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55"
                  >
                    {isMuted ? (
                      <VolumeX className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Story Image with Ambient Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pt-12"
              >
                <img
                  src={activeStory.image}
                  alt={activeStory.title}
                  className="h-full w-auto object-contain object-bottom drop-shadow-2xl"
                />
              </motion.div>
            </AnimatePresence>

            {/* Bottom Story Overlay & CTA */}
            <div className="relative z-20 mt-auto bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-5 pt-14">
              <p className="text-[10px] font-bold uppercase text-[#E5B869]">
                {activeStory.collection}
              </p>
              <h3 className="mt-0.5 text-xl font-extrabold text-white">
                {activeStory.title}
              </h3>
              <p className="mt-1 text-pretty text-xs leading-relaxed text-white/80">
                {activeStory.description}
              </p>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-base font-extrabold tabular-nums text-white">
                  {formatINR(activeStory.price)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdd(activeStory)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-white',
                      justAddedId === activeStory.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#8B1E2B] text-white hover:bg-[#A62433]',
                    )}
                  >
                    {justAddedId === activeStory.id ? (
                      <>
                        <Check className="size-3.5" aria-hidden="true" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" aria-hidden="true" />
                        <span>Add to bag</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Step Arrow (Mobile) */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Next bridal story"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:hidden"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          {/* Right Angled 3D Coverflow Story */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label={`Next story: ${BRIDAL_STORIES[nextIndex].title}`}
            style={{
              transform: 'rotateY(-22deg) scale(0.82)',
              backgroundColor: BRIDAL_STORIES[nextIndex].bgHex,
            }}
            className="hidden h-[410px] w-[230px] shrink-0 overflow-hidden rounded-3xl border border-white/10 opacity-55 shadow-2xl transition-opacity hover:opacity-85 md:block"
          >
            <img
              src={BRIDAL_STORIES[nextIndex].image}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 text-left">
              <p className="text-xs font-bold text-white">
                {BRIDAL_STORIES[nextIndex].title}
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
