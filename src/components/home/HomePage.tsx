import { getAllProducts } from '@/catalog';
import { getCatalogStats } from '@/catalog/stats';
import { isIndoorSeason, type HomeIntroVariant } from '@/content/home';
import { Hero } from './Hero';
import { StickwijzerExplainer } from './StickwijzerExplainer';
import { MethodBand } from './MethodBand';
import { FeaturedProducts } from './FeaturedProducts';
import { SeasonBand } from './SeasonBand';
import { CampaignBand } from './CampaignBand';
import { BLACK_FRIDAY_EDITION } from '@/content/blackFriday';
import { amsterdamDate, showCampaignNote } from '@/lib/campaign';
import { BuyingIntro } from './BuyingIntro';
import { InstagramFeed } from './InstagramFeed';
import { WhyUs } from './WhyUs';
import { QuickFind } from './QuickFind';
import { ProofStrip } from './ProofStrip';
import { ClosingCta } from './ClosingCta';

export function HomePage({ variant }: { variant: HomeIntroVariant }) {
  const products = getAllProducts();
  // The stickwijzer advises field sticks only, from the whole catalog
  // including the PassaHockey import: count exactly those.
  const adviceCount = getCatalogStats().fieldSticks;
  const campaign = showCampaignNote(BLACK_FRIDAY_EDITION, amsterdamDate(new Date()));
  return (
    <>
      <Hero />
      {/*
        Under the hero, in this order (owner, 2026-11-18): the compact indoor
        block, then the Black Friday card. The indoor block no longer depends on
        the campaign (since #198 the card took its place); it follows the
        season and the homepage variant.
      */}
      {variant === 'season' && isIndoorSeason() && <SeasonBand />}
      {campaign && <CampaignBand />}
      <QuickFind />
      <ProofStrip />
      {variant === 'buying' && <BuyingIntro />}
      <StickwijzerExplainer productCount={adviceCount} />
      <MethodBand />
      <WhyUs />
      <FeaturedProducts products={products.slice(0, 3)} />
      <InstagramFeed />
      <ClosingCta />
    </>
  );
}
