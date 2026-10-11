import { BUYING_INTRO } from '@/content/home';
import { HomeBlockLink } from './HomeBlockLink';

const LINK_CLASS =
  'font-semibold text-veld underline underline-offset-2 hover:text-inkt';

/**
 * Variant B: a short, quiet text block on choosing a good stick at all, with
 * the indoor stick singled out as a special case. Plain text and links, no
 * buttons, so the stickwijzer stays the one primary action.
 */
export function BuyingIntro() {
  const { heading, paragraphs, readMore, special } = BUYING_INTRO;
  return (
    <section
      aria-labelledby="goede-stick-heading"
      className="border-b border-rand bg-white"
    >
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[3fr_2fr] md:gap-10">
        <div>
          <h2 id="goede-stick-heading" className="text-xl font-bold">
            {heading}
          </h2>
          {paragraphs.map((text) => (
            <p key={text} className="mt-2 text-inkt/80">
              {text}
            </p>
          ))}
          <p className="mt-2">
            <HomeBlockLink
              block="buying"
              href={readMore.href}
              className={LINK_CLASS}
            >
              {readMore.label} →
            </HomeBlockLink>
          </p>
        </div>
        <aside
          aria-labelledby="zaalstick-heading"
          className="border-l-4 border-veld pl-4"
        >
          <h3 id="zaalstick-heading" className="font-bold">
            {special.heading}
          </h3>
          <p className="mt-1 text-sm text-inkt/80">{special.body}</p>
          <p className="mt-2 text-sm">
            <HomeBlockLink
              block="buying"
              href={special.link.href}
              className={LINK_CLASS}
            >
              {special.link.label} →
            </HomeBlockLink>
          </p>
        </aside>
      </div>
    </section>
  );
}
