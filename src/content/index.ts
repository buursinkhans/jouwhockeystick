import type { Article } from './types';
import { hockeystickLengteTabel } from './articles/hockeystick-lengte-tabel';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { hockeystickVolwassenBeginner } from './articles/hockeystick-volwassen-beginner';
import { lowBowVsMidBow } from './articles/low-bow-vs-mid-bow';
import { hoeKiesJeDeJuisteHockeystick } from './articles/hoe-kies-je-de-juiste-hockeystick';
import { zaalstickVoorKinderen } from './articles/zaalstick-voor-kinderen';
import { veldstickZaalhockey } from './articles/veldstick-zaalhockey';
import { zaalstickBudget } from './articles/zaalstick-budget';

/** Listed on /kennis in this order. */
const ALL_ARTICLES: Article[] = [
  hockeystickLengteTabel,
  hockeystickKinderenEnBeginners,
  hockeystickVolwassenBeginner,
  zaalstickVoorKinderen,
  veldstickZaalhockey,
  zaalstickBudget,
  lowBowVsMidBow,
  hoeKiesJeDeJuisteHockeystick,
];

export function getAllArticles(): Article[] {
  return ALL_ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ALL_ARTICLES.find((article) => article.slug === slug);
}
