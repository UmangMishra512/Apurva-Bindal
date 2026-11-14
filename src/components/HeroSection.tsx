import { motion } from 'motion/react';
import { Crown } from 'lucide-react';
import { STORE_INFO } from '../data/storeData';
import { PillCta } from './ui';

export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Apurva Bridal Showroom Hero"
      className="relative flex min-h-[620px] h-[88dvh] max-h-[840px] w-full items-end overflow-hidden bg-[#1D0408]"
    >
      {/* Ambient Ken Burns Motion Backdrop */}
      <img
        src="/images/hero-showroom.jpg"
        alt="Inside Apurva Bridal Lehanga & Sarees showroom at Khetan Super Market, Patna"
        className="animate-ken-burns absolute inset-0 size-full object-cover object-center opacity-85"
      />

      {/* Parted Royal Crimson Stage Curtains Framing the Viewport */}
      <motion.div
        aria-hidden="true"
        initial={{ x: 0 }}
        animate={{ x: '-58%' }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 bg-gradient-to-r from-[#3D0710]/95 via-[#5E0E1A]/75 to-transparent"
      />
      <motion.div
        aria-hidden="true"
        initial={{ x: 0 }}
        animate={{ x: '58%' }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/3 bg-gradient-to-l from-[#3D0710]/95 via-[#5E0E1A]/75 to-transparent"
      />

      {/* Scrim for guaranteed text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/35"
      />

      {/* Subtle Centered Crest Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-24 z-20 flex -translate-x-1/2 flex-col items-center text-center sm:top-28"
      >
        <Crown className="size-7 text-[#E5B869]" aria-hidden="true" />
        <span className="mt-1 font-editorial-serif text-lg font-semibold italic text-[#F5DB9A]">
          Apurva Heritage Looms
        </span>
      </motion.div>

      <div className="relative z-20 mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full border border-[#E5B869]/40 bg-black/55 px-3.5 py-1 text-[11px] font-semibold uppercase text-[#F7DF9F] backdrop-blur-sm">
            {STORE_INFO.tagline}
          </span>

          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Draped for the Sacred Aisle.
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
            {STORE_INFO.fullTitle} brings hand-worked bridal lehengas, pure Banarasi silks, and custom wedding trousseaus to Shop B-43 &amp; B-44, Khetan Super Market, Patna.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PillCta label="Try the Look" href="#lookbook" variant="primary" />
            <PillCta label="Browse the Rack" href="#rack" variant="ghost" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
