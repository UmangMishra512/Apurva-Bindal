import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, MapPin } from 'lucide-react';
import { cn } from '../lib/cn';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'archive', label: 'Archive' },
  { id: 'lookbook', label: 'Try the Look' },
  { id: 'pick-a-silk', label: 'Pick a Silk' },
  { id: 'rack', label: 'The Rack' },
  { id: 'muse', label: 'The Muse' },
  { id: 'bridal-stories', label: 'Bridal' },
] as const;

interface NavbarProps {
  bagCount: number;
  onOpenBag: () => void;
}

export function Navbar({ bagCount, onOpenBag }: NavbarProps) {
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    for (const section of sections) {
      observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:px-6">
      <div className="pointer-events-auto flex w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1500px] items-center justify-between gap-2 rounded-full border border-[#E5B869]/30 bg-[#3B0A12]/90 px-2.5 py-1.5 text-white shadow-xl backdrop-blur-md">
        <a
          href="#home"
          className="flex shrink-0 items-center gap-2 rounded-full pl-2 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B869]"
        >
          <span className="flex size-7 items-center justify-center rounded-full border border-[#E5B869]/50 bg-[#5C121D] text-xs font-extrabold text-[#F3D28B]">
            A
          </span>
          <span className="text-sm font-extrabold tracking-tight text-white">
            APURVA
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setActiveId(link.id)}
                className={cn(
                  'relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B869]',
                  isActive ? 'text-neutral-950' : 'text-white/85 hover:text-white',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-0 z-0 rounded-full bg-[#E5B869]"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Open shopping bag, ${bagCount} items`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B869]"
          >
            <ShoppingBag className="size-3.5 text-[#F3D28B]" aria-hidden="true" />
            <span className="tabular-nums">{bagCount}</span>
          </button>

          <a
            href="#showroom"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1E2B] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#A62433] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Visit Store</span>
          </a>
        </div>
      </div>
    </header>
  );
}
