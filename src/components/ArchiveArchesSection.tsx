import { motion } from 'motion/react';
import { ARCHIVE_MOODS } from '../data/storeData';
import { TwoToneHeading } from './ui';

const JHAROKHA_CLIP =
  'polygon(50% 0%, 66% 4%, 82% 11%, 94% 21%, 100% 34%, 100% 100%, 0% 100%, 0% 34%, 6% 21%, 18% 11%, 34% 4%)';

export function ArchiveArchesSection() {
  return (
    <section
      id="archive"
      className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1880px] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-[#8B1E2B]">
            The Apurva Archive
          </p>
          <TwoToneHeading lead="Six Moods." accent="Timeless Drapes" className="mt-1" />
        </div>
        <p className="max-w-xs text-pretty text-xs leading-relaxed text-neutral-600 sm:text-right sm:text-sm">
          Tap any arch to jump straight into our Patna wedding &amp; festive curations.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ARCHIVE_MOODS.map((mood) => (
          <motion.a
            key={mood.id}
            href={mood.targetSection}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="group flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B1E2B]"
          >
            <div
              style={{
                backgroundColor: mood.bgTint,
                clipPath: JHAROKHA_CLIP,
              }}
              className="relative aspect-[3/4] w-full overflow-hidden shadow-sm transition-shadow duration-200 group-hover:shadow-lg"
            >
              <img
                src={mood.image}
                alt={`${mood.title} — ${mood.tag}`}
                className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </div>

            <h3 className="mt-3 text-sm font-bold text-neutral-950 transition-colors group-hover:text-[#8B1E2B]">
              {mood.title}
            </h3>
            <p className="text-[11px] font-medium text-neutral-500">{mood.tag}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
