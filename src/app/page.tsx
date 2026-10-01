import { getAllProducts } from '@/catalog';
import { Hero } from '@/components/home/Hero';
import { StickwijzerExplainer } from '@/components/home/StickwijzerExplainer';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export default function Home() {
  const products = getAllProducts();

  return (
    <>
      <Hero />
      <StickwijzerExplainer productCount={products.length} />
      <FeaturedProducts products={products.slice(0, 3)} />
    </>
  );
}
