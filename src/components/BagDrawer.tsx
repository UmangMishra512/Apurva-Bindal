import { useEffect, useRef } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { STORE_INFO, formatINR, type BagItem } from '../data/storeData';

interface BagDrawerProps {
  open: boolean;
  items: BagItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function BagDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemove,
}: BagDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const whatsappBody = items
    .map((item) => `• ${item.name} (${item.meta}) x${item.quantity} — ${formatINR(item.price * item.quantity)}`)
    .join('\n');
  const whatsappUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Namaste Apurva Bridal Patna! I would like to inquire about:\n${whatsappBody}\nEstimated Total: ${formatINR(subtotal)}`,
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      onClick={onClose}
    >
      <div
        className="flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-[#8B1E2B]" aria-hidden="true" />
            <h2 className="text-base font-bold text-neutral-950">Your Bridal Bag</h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex size-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E2B]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="size-10 text-neutral-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-neutral-900">
                Your bridal bag is empty
              </p>
              <p className="mt-1 max-w-xs text-xs text-neutral-500">
                Tap a lookbook bundle, custom blouse size, or quick-add card to build your Patna showroom wishlist.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-full bg-[#8B1E2B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#741823]"
              >
                Explore Bridal Edits
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 p-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-500">{item.meta}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => onRemove(item.id)}
                        className="text-neutral-400 transition-colors hover:text-[#8B1E2B]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-neutral-200">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="flex size-7 items-center justify-center text-neutral-600 hover:text-neutral-950"
                        >
                          <Minus className="size-3" aria-hidden="true" />
                        </button>
                        <span className="px-2 text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="flex size-7 items-center justify-center text-neutral-600 hover:text-neutral-950"
                        >
                          <Plus className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-neutral-950">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Estimated Total</span>
              <span className="text-xl font-extrabold tabular-nums text-neutral-950">
                {formatINR(subtotal)}
              </span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1E2B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741823]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              <span>Reserve Trial on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
