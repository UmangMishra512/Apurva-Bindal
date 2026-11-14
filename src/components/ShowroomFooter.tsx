import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

export function ShowroomFooter() {
  return (
    <footer
      id="showroom"
      className="border-t border-neutral-200 bg-neutral-950 text-white"
    >
      <div className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 py-14 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-xs font-bold uppercase text-[#E48C96]">
              Patna Heritage Showroom
            </p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight">
              {STORE_INFO.fullTitle}
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-neutral-300">
              Bridal lehengas, heavy &amp; light trousseaus, Banarasi silk sarees, party gowns, and in-house custom choli fitting in the heart of Khetan Market.
            </p>
            <p className="mt-4 text-xs text-neutral-400">
              Registered Trade Entity: Apurva Saree • GSTIN {STORE_INFO.gstin}
            </p>
          </div>

          <div className="space-y-4 md:col-span-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#E48C96]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-neutral-200">
                {STORE_INFO.address}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-[#E48C96]" aria-hidden="true" />
              <p className="text-sm text-neutral-200">{STORE_INFO.hours}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-[#E48C96]" aria-hidden="true" />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm tabular-nums text-neutral-200">
                {STORE_INFO.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                    className="underline-offset-4 hover:text-white hover:underline"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 md:col-span-3 md:items-end">
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
                'Hello Apurva Bridal Patna, I would like to book a bridal trial at Khetan Super Market.',
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a32433] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              <span>Book Showroom Visit</span>
            </a>
            <p className="text-xs text-neutral-500">
              Preview catalog &amp; pricing shown for showroom showcase.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
