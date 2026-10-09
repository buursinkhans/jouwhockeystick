import type { Article } from './types';
import { hockeystickLengteTabel } from './articles/hockeystick-lengte-tabel';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { lowBowVsMidBow } from './articles/low-bow-vs-mid-bow';
import { hoeKiesJeDeJuisteHockeystick } from './articles/hoe-kies-je-de-juiste-hockeystick';
import { zaalstickVoorKinderen } from './articles/zaalstick-voor-kinderen';

/** Listed on /kennis in this order. */
const ALL_ARTICLES: Article[] = [
  hockeystickLengteTabel,
  hockeystickKinderenEnBeginners,
  zaalstickVoorKinderen,
  lowBowVsMidBow,
  hoeKiesJeDeJuisteHockeystick,
];

export function getAllArticles(): Article[] {
  return ALL_ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ALL_ARTICLES.find((article) => article.slug === slug);
}
