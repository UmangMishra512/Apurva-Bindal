import { useState, useRef, useEffect, useMemo, type PointerEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Plus, Check, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { DECK_CARDS, formatINR, type DeckCardItem } from '../data/storeData';
import { cn } from '../lib/cn';
import { TwoToneHeading } from './ui';

interface CardDeckSectionProps {
  onQuickAdd: (card: DeckCardItem) => void;
}

interface ArcSilkCardProps {
  card: DeckCardItem;
  offsetFromCenter: number;
  cardStride: number;
  isAdded: boolean;
  isLiked: boolean;
  onToggleLike: () => void;
  onQuickAdd: () => void;
  onSelectCenter: () => void;
}

function ArcSilkCard({
  card,
  offsetFromCenter,
  cardStride,
  isAdded,
  isLiked,
  onToggleLike,
  onQuickAdd,
  onSelectCenter,
}: ArcSilkCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [pokeKey, setPokeKey] = useState(0);

  // 3D Cursor-Tracking Perspective Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 24 });

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-13, 13]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [13, -13]);

  // Curved Arc Fan Positioning
  const arcRotate = offsetFromCenter * 3.5;
  const arcTranslateY = Math.pow(offsetFromCenter, 2) * 11;
  const isCenter = offsetFromCenter === 0;

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handlePoke() {
    setPokeKey((k) => k + 1);
    onSelectCenter();
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 20,
        marginLeft: -117, // Half of card width ~235px
        perspective: 1000,
        zIndex: Math.max(1, 30 - Math.abs(offsetFromCenter) * 4),
        pointerEvents: Math.abs(offsetFromCenter) >= 5 ? 'none' : 'auto',
      }}
      className="shrink-0"
    >
      <motion.article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handlePoke}
        animate={{
          x: offsetFromCenter * cardStride,
          y: arcTranslateY,
          rotate: arcRotate,
          scale: isCenter ? 1.04 : Math.max(0.88, 0.96 - Math.abs(offsetFromCenter) * 0.015),
          opacity: Math.abs(offsetFromCenter) >= 5 ? 0 : Math.abs(offsetFromCenter) >= 4 ? 0.35 : 1,
        }}
        whileHover={{
          y: arcTranslateY - 14,
          scale: isCenter ? 1.07 : 1.01,
        }}
        whileTap={{ scale: 0.94 }}
        style={{
          backgroundColor: card.bgColor,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
        className={cn(
          'group relative flex h-[370px] w-[225px] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-4 shadow-xl ring-1 ring-black/15 sm:h-[390px] sm:w-[235px] select-none',
          isCenter ? 'ring-2 ring-white/30 shadow-2xl' : '',
        )}
      >
        {/* Top-right Favorite Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          aria-pressed={isLiked}
          aria-label={isLiked ? `Remove ${card.title} from wishlist` : `Save ${card.title} to wishlist`}
          className="absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-xs transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-white"
        >
          <Heart
            className={cn('size-4', isLiked && 'fill-white text-white')}
            aria-hidden="true"
          />
        </button>

        {/* Z-0 Oversized Condensed Display Typography BEHIND Cutout */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-0 select-none pt-2 text-center font-poster-display uppercase leading-[0.86] text-white/95"
        >
          <span className="block text-[2.9rem]">{card.labelTop}</span>
          <span className="block text-[2.9rem]">{card.labelBottom}</span>
        </div>

        {/* Z-10 Transparent Model Cutout with Tactile Silk Poke Elastic Rebound */}
        <motion.div
          key={pokeKey}
          initial={pokeKey > 0 ? { scale: 0.92, y: 6 } : false}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 14 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 top-14 z-10 flex items-end justify-center"
        >
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-auto object-contain object-bottom drop-shadow-xl"
          />
        </motion.div>

        {/* Z-20 Bottom Scrim, Price & Quick-Add */}
        <div className="relative z-20 mt-auto flex items-end justify-between rounded-2xl bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-8">
          <div className="min-w-0 pr-2 text-white">
            <p className="truncate text-xs font-bold">{card.title}</p>
            <p className="text-sm font-extrabold tabular-nums text-white/95">
              {formatINR(card.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            aria-label={`Add ${card.title} to bag`}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              isAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-neutral-950 hover:bg-[#8B1E2B] hover:text-white',
            )}
          >
            {isAdded ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </motion.article>
    </div>
  );
}

export function CardDeckSection({ onQuickAdd }: CardDeckSectionProps) {
  const [centerIndex, setCenterIndex] = useState(3);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [cardStride, setCardStride] = useState(248);

  const touchStartX = useRef<number | null>(null);
  const n = DECK_CARDS.length; // 7 silk cards
  const windowRadius = 5; // 5 cards to left, 1 center, 5 cards to right = 11 virtual slots

  // Responsive stride detection for phone / tablet / Mac
  useEffect(() => {
    const updateStride = () => {
      const w = window.innerWidth;
      setCardStride(w < 640 ? 216 : w < 1024 ? 236 : 248);
    };
    updateStride();
    window.addEventListener('resize', updateStride);
    return () => window.removeEventListener('resize', updateStride);
  }, []);

  function handleAdd(card: DeckCardItem) {
    onQuickAdd(card);
    setAddedCardId(card.id);
    window.setTimeout(() => {
      setAddedCardId((curr) => (curr === card.id ? null : curr));
    }, 1200);
  }

  // Endless circular stepping (never clamped, always advances or reverses)
  function stepDeck(delta: -1 | 1) {
    setCenterIndex((prev) => prev + delta);
  }

  // Generate 11 virtual slots centered at centerIndex
  const visibleSlots = useMemo(() => {
    const slots = [];
    for (let s = centerIndex - windowRadius; s <= centerIndex + windowRadius; s++) {
      const cardIndex = ((s % n) + n) % n;
      slots.push({
        slotIndex: s,
        card: DECK_CARDS[cardIndex],
        offsetFromCenter: s - centerIndex,
      });
    }
    return slots;
  }, [centerIndex, n, windowRadius]);

  // Touch gesture swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        stepDeck(1);
      } else {
        stepDeck(-1);
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="pick-a-silk"
      className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-[#8B1E2B]">
            Tactile Swatch Deck • Endless Loop
          </p>
          <TwoToneHeading lead="Pick a" accent="Silk" className="mt-1" />
        </div>

        <div className="flex items-center gap-4">
          <p className="max-w-xs text-pretty text-xs leading-relaxed text-neutral-600 sm:text-right sm:text-sm">
            Tilt a card, press it, poke the silk. Tap{' '}
            <span className="inline-flex size-4 items-center justify-center rounded-full border border-neutral-400 text-[10px] font-bold text-neutral-900">
              +
            </span>{' '}
            to drop an edit into your bag.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stepDeck(-1)}
              aria-label="Previous silk card (endless loop)"
              className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-2xs transition-all hover:border-[#8B1E2B] hover:text-[#8B1E2B] hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => stepDeck(1)}
              aria-label="Next silk card (endless loop)"
              className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-2xs transition-all hover:border-[#8B1E2B] hover:text-[#8B1E2B] hover:scale-105 active:scale-95"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Endless Curved Arc Fan Stage */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative mt-10 h-[510px] sm:h-[550px] md:h-[580px] w-full overflow-hidden flex items-start justify-center pt-4"
      >
        {visibleSlots.map(({ slotIndex, card, offsetFromCenter }) => (
          <ArcSilkCard
            key={`slot-${slotIndex}`}
            card={card}
            offsetFromCenter={offsetFromCenter}
            cardStride={cardStride}
            isAdded={addedCardId === card.id}
            isLiked={Boolean(likedIds[card.id])}
            onToggleLike={() =>
              setLikedIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
            }
            onQuickAdd={() => handleAdd(card)}
            onSelectCenter={() => setCenterIndex(slotIndex)}
          />
        ))}
      </div>
    </section>
  );
}
