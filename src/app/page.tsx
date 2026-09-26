import { getAllProducts } from '@/catalog';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export default function Home() {
  const featured = getAllProducts().slice(0, 3);

  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedProducts products={featured} />
    </>
  );
}
