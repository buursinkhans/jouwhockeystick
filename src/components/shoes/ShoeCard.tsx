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
    <article className="flex h-full flex-col rounded-3xl border border-rand bg-white p-5 shadow-sm">
      <div className="bg-hex-light flex h-40 items-center justify-center rounded-2xl bg-krijt">
        <ShoeImage shoe={shoe} className="h-32 w-32" />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wide text-veld uppercase">{shoe.brand}</p>
      <h3 className="mt-1 text-lg leading-snug font-bold">
        <Link href={shoePath(shoe)} className="hover:underline">
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
      <div className="mt-auto pt-4">
        <ShoeOfferSummary shoe={shoe} />
      </div>
    </article>
  );
}
