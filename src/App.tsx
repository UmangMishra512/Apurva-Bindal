import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import type {
  BagItem,
  BridalStoryItem,
  BundlePiece,
  DeckCardItem,
  LookbookEntry,
  RackBlouse,
} from './data/storeData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeTicker } from './components/MarqueeTicker';
import { ArchiveArchesSection } from './components/ArchiveArchesSection';
import { LookbookSection } from './components/LookbookSection';
import { CardDeckSection } from './components/CardDeckSection';
import { RackCarouselSection } from './components/RackCarouselSection';
import { EditorialCollageSection } from './components/EditorialCollageSection';
import { BridalStoriesSection } from './components/BridalStoriesSection';
import { ShowroomFooter } from './components/ShowroomFooter';
import { BagDrawer } from './components/BagDrawer';

export function App() {
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);

  function upsertBagItem(newItem: Omit<BagItem, 'quantity'>) {
    setBagItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }

  function handleAddPiece(piece: BundlePiece, lookTitle: string) {
    upsertBagItem({
      id: piece.id,
      name: piece.name,
      meta: `${piece.category} • ${lookTitle}`,
      price: piece.price,
      image: piece.thumb,
    });
  }

  function handleAddFullLook(look: LookbookEntry) {
    const rawTotal = look.pieces.reduce((sum, piece) => sum + piece.price, 0);
    const discounted = Math.round(rawTotal * 0.9);
    upsertBagItem({
      id: `bundle-${look.id}`,
      name: `${look.title} (Full Bridal Bundle)`,
      meta: `${look.pieces.length} Pieces • 10% Bundle Savings`,
      price: discounted,
      image: look.image,
    });
    setIsBagOpen(true);
  }

  function handleAddBlouse(blouse: RackBlouse, size: number) {
    upsertBagItem({
      id: `${blouse.id}-sz-${size}`,
      name: blouse.name,
      meta: `Size ${size} • Custom Choli`,
      price: blouse.price,
      image: blouse.image,
    });
  }

  function handleQuickAddCard(card: DeckCardItem) {
    upsertBagItem({
      id: card.id,
      name: card.title,
      meta: card.subtitle,
      price: card.price,
      image: card.image,
    });
  }

  function handleAddStoryItem(story: BridalStoryItem) {
    upsertBagItem({
      id: story.id,
      name: story.title,
      meta: story.collection,
      price: story.price,
      image: story.image,
    });
  }

  function handleUpdateQty(id: string, delta: number) {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleRemove(id: string) {
    setBagItems((prev) => prev.filter((item) => item.id !== id));
  }

  const totalCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-white text-neutral-950">
        <Navbar bagCount={totalCount} onOpenBag={() => setIsBagOpen(true)} />
        <main>
          <HeroSection />
          <MarqueeTicker />
          <ArchiveArchesSection />
          <LookbookSection
            onAddPiece={handleAddPiece}
            onAddFullLook={handleAddFullLook}
          />
          <CardDeckSection onQuickAdd={handleQuickAddCard} />
          <RackCarouselSection onAddBlouse={handleAddBlouse} />
          <EditorialCollageSection />
          <BridalStoriesSection onAddStoryItem={handleAddStoryItem} />
        </main>
        <ShowroomFooter />
        <BagDrawer
          open={isBagOpen}
          items={bagItems}
          onClose={() => setIsBagOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
        />
      </div>
    </MotionConfig>
  );
}

export default App;
