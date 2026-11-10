import { getAllProducts } from '@/catalog';
import { getCatalogStats } from '@/catalog/stats';
import { isIndoorSeason, type HomeIntroVariant } from '@/content/home';
import { Hero } from './Hero';
import { StickwijzerExplainer } from './StickwijzerExplainer';
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
      {/* Directly under the hero during the campaign (2026-11-10); it takes the season band's place, so one band at a time. */}
      {campaign && <CampaignBand />}
      <QuickFind />
      <ProofStrip />
      {!campaign && variant === 'season' && isIndoorSeason() && <SeasonBand />}
      {variant === 'buying' && <BuyingIntro />}
      <StickwijzerExplainer productCount={adviceCount} />
      <WhyUs />
      <FeaturedProducts products={products.slice(0, 3)} />
      <InstagramFeed />
      <ClosingCta />
    </>
  );
}
