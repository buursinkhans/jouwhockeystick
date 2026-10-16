import type { Article } from './types';
import { visibleItems } from './schedule';
import { hockeystickLengteTabel } from './articles/hockeystick-lengte-tabel';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { lowBowVsMidBow } from './articles/low-bow-vs-mid-bow';
import { hoeKiesJeDeJuisteHockeystick } from './articles/hoe-kies-je-de-juiste-hockeystick';
import { zaalstickVoorKinderen } from './articles/zaalstick-voor-kinderen';
import { veldstickZaalhockey } from './articles/veldstick-zaalhockey';
import { zaalstickBudget } from './articles/zaalstick-budget';
import { waarKoopJeEenHockeystick } from './articles/waar-koop-je-een-hockeystick';

/** Listed on /kennis in this order. */
const ALL_ARTICLES: Article[] = [
  hockeystickLengteTabel,
  hockeystickKinderenEnBeginners,
  zaalstickVoorKinderen,
  veldstickZaalhockey,
  zaalstickBudget,
  lowBowVsMidBow,
  hoeKiesJeDeJuisteHockeystick,
  waarKoopJeEenHockeystick,
];

/** Articles a visitor may see now (scheduled ones only on previews). */
export function getAllArticles(): Article[] {
  return visibleItems(ALL_ARTICLES);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

/** Every article, including scheduled ones. For tests and the publication workflow. */
export function getArticlesIncludingScheduled(): Article[] {
  return [...ALL_ARTICLES];
}
