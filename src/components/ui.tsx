import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';

interface TwoToneHeadingProps {
  lead: string;
  accent: string;
  italicAccent?: boolean;
  className?: string;
}

export function TwoToneHeading({
  lead,
  accent,
  italicAccent = false,
  className,
}: TwoToneHeadingProps) {
  return (
    <h2
      className={cn(
        'text-balance text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl',
        className,
      )}
    >
      {lead}{' '}
      <span
        className={cn(
          'text-[#8B1E2B]',
          italicAccent && 'font-editorial-serif italic font-semibold',
        )}
      >
        {accent}
      </span>
    </h2>
  );
}

interface PillCtaProps {
  label: string;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function PillCta({
  label,
  variant = 'primary',
  onClick,
  href,
  className,
}: PillCtaProps) {
  const isPrimary = variant === 'primary';
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  // Animmaster-style magnetic cursor attraction
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    setMagneticOffset({ x, y });
  };

  const handlePointerLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  const baseClass = cn(
    'group relative inline-flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-semibold shadow-xs select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]',
    isPrimary
      ? 'bg-[#8B1E2B] text-white hover:bg-[#741823]'
      : 'bg-white/95 text-neutral-950 border border-neutral-200/80 hover:bg-white',
    className,
  );

  const circleClass = cn(
    'flex size-7 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:scale-105',
    isPrimary ? 'bg-white text-[#8B1E2B]' : 'bg-neutral-950 text-white',
  );

  const content = (
    <>
      <span className="relative z-10">{label}</span>
      <span className={circleClass} aria-hidden="true">
        <ArrowRight className="size-3.5" />
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        href={href}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        animate={{ x: magneticOffset.x, y: magneticOffset.y }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        whileTap={{ scale: 0.97 }}
        className={baseClass}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={{ x: magneticOffset.x, y: magneticOffset.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      whileTap={{ scale: 0.97 }}
      className={baseClass}
    >
      {content}
    </motion.button>
  );
}
