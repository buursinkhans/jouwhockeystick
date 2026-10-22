import { getAllProducts } from '@/catalog';
import { getCatalogStats } from '@/catalog/stats';
import { isIndoorSeason, type HomeIntroVariant } from '@/content/home';
import { Hero } from './Hero';
import { StickwijzerExplainer } from './StickwijzerExplainer';
import { FeaturedProducts } from './FeaturedProducts';
import { SeasonBand } from './SeasonBand';
import { BuyingIntro } from './BuyingIntro';
import { InstagramFeed } from './InstagramFeed';

export function HomePage({ variant }: { variant: HomeIntroVariant }) {
  const products = getAllProducts();
  // The stickwijzer advises field sticks only, from the whole catalog
  // including the PassaHockey import: count exactly those.
  const adviceCount = getCatalogStats().fieldSticks;
  return (
    <>
      <Hero />
      {variant === 'season' && isIndoorSeason() && <SeasonBand />}
      {variant === 'buying' && <BuyingIntro />}
      <StickwijzerExplainer productCount={adviceCount} />
      <FeaturedProducts products={products.slice(0, 3)} />
      <InstagramFeed />
    </>
  );
}
