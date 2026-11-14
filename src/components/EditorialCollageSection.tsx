import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { PillCta, TwoToneHeading } from './ui';

export function EditorialCollageSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isPlayingFilm, setIsPlayingFilm] = useState(true);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Differential scroll parallax for left & right vertical editorial columns
  const leftColumnY = useTransform(scrollYProgress, [0, 1], [42, -42]);
  const rightColumnY = useTransform(scrollYProgress, [0, 1], [-42, 42]);

  return (
    <section
      id="muse"
      ref={sectionRef}
      className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16"
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase text-[#8B1E2B]">
          The Muse Film
        </p>
        <TwoToneHeading lead="Feel the" accent="drape" italicAccent className="mt-1" />
      </div>

      <div className="mt-10 grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Left Parallax Vertical 3-Photo Column */}
        <motion.div
          style={{ y: leftColumnY }}
          className="hidden grid-cols-1 gap-4 lg:col-span-2 lg:grid"
        >
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xs">
            <img
              src="/images/editorial-side-1.jpg"
              alt="Close-up of crimson silk saree pleats and antique gold zari pallu"
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xs">
            <img
              src="/images/editorial-side-2.jpg"
              alt="Bride in mustard-gold Banarasi lehenga surrounded by marigold garlands"
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[#F5E8EA] shadow-xs">
            <img
              src="/images/look-rose.png"
              alt="Pastel rose sangeet raw silk lehenga detail"
              className="aspect-[3/4] w-full object-cover object-top transition-transform duration-300 hover:scale-105"
            />
          </div>
        </motion.div>

        {/* Center Living Editorial Film Showcase */}
        <div className="flex flex-col items-center lg:col-span-8">
          <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 shadow-lg">
            <img
              src="/images/editorial-center.jpg"
              alt="Modern Indian bride in a crimson Banarasi silk saree wearing studio headphones in a heritage courtyard"
              className={
                isPlayingFilm
                  ? 'animate-ken-burns aspect-video w-full object-cover object-center'
                  : 'aspect-video w-full object-cover object-center'
              }
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
              <span className="rounded-full bg-black/65 px-3.5 py-1 text-[11px] font-semibold uppercase text-white backdrop-blur-sm">
                Muse Film 2026 • Khetan Market, Patna
              </span>
              <button
                type="button"
                onClick={() => setIsPlayingFilm((p) => !p)}
                aria-label={isPlayingFilm ? 'Pause muse film motion' : 'Play muse film motion'}
                className="flex size-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-colors hover:bg-[#8B1E2B]"
              >
                {isPlayingFilm ? (
                  <Pause className="size-3.5" aria-hidden="true" />
                ) : (
                  <Play className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <PillCta
            label="Purchase the Collection"
            href="#bridal-stories"
            variant="primary"
            className="mt-6"
          />
        </div>

        {/* Right Opposite-Parallax Vertical 3-Photo Column */}
        <motion.div
          style={{ y: rightColumnY }}
          className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-1"
        >
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xs">
            <img
              src="/images/hero-showroom.jpg"
              alt="Carved wood shelves stacked with handwoven silk sarees inside the showroom"
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[#8B1E2B]/10 shadow-xs">
            <img
              src="/images/look-crimson.png"
              alt="Full bridal crimson velvet zardozi lehenga silhouette"
              className="aspect-[3/4] w-full object-cover object-top transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-[#E6F1ED] shadow-xs lg:block">
            <img
              src="/images/look-emerald.png"
              alt="Kanchipuram emerald silk saree editorial drape"
              className="aspect-[3/4] w-full object-cover object-top transition-transform duration-300 hover:scale-105"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
