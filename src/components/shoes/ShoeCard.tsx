import Link from 'next/link';
import { shoePath } from '@/catalog/shoes';
import type { Shoe } from '@/catalog/shoes/types';
import { AGE_LABEL, CATEGORY_LABEL } from '@/content/hockeyschoenen';
import { NonMarkingWarning } from './NonMarkingWarning';
import { ShoeImage } from './ShoeImage';
import { ShoeStatus } from './ShoeStatus';
import { ShoeOfferSummary } from './ShoeWhereToBuy';

/** A shoe in the overview, like ProductCard: photo, name, kind, status and the cheapest shop. */
export function ShoeCard({ shoe }: { shoe: Shoe }) {
  return (
    // Same treatment as ProductCard (fase 7): the whole card opens the model page.
    <article className="card card-link group relative flex h-full flex-col p-5">
      <div className="flex h-48 items-center justify-center">
        <ShoeImage
          shoe={shoe}
          className="h-44 w-44 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-[0.06em] text-veld uppercase">{shoe.brand}</p>
      <h3 className="mt-1 text-[1.0625rem] leading-snug font-bold text-inkt">
        <Link href={shoePath(shoe)} className="after:absolute after:inset-0 after:rounded-[1.25rem]">
          {shoe.model}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-inkt/80">
        {CATEGORY_LABEL[shoe.category.value]} · {AGE_LABEL[shoe.ageGroup]}
      </p>
      <div className="mt-3">
        <ShoeStatus shoe={shoe} compact />
        <NonMarkingWarning shoe={shoe} compact />
      </div>
      <div className="relative z-10 mt-auto pt-5">
        <ShoeOfferSummary shoe={shoe} />
      </div>
    </article>
  );
}
