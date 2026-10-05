import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { ProductSpecTable } from '@/components/catalog/ProductSpecTable';
import { ProductProsAndCons } from '@/components/catalog/ProductProsAndCons';
import { ProductImage } from '@/components/catalog/ProductImage';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { ButtonLink } from '@/components/ui/Button';
import { RetailerLinks } from '@/components/ui/RetailerLinks';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductFitAndSources } from '@/components/catalog/ProductFitAndSources';

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {};
  }
  return pageMetadata({
    title: product.name,
    description: product.summary,
    path: `/sticks/${slug}`,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Structured data describes only visibly verifiable information on this
  // page, and deliberately omits `offers`/price since the actual purchase
  // and any live pricing happens on bol.com, not on this page.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: product.brand,
    description: product.summary,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Sticks', href: '/sticks' },
          { label: product.name, href: `/sticks/${product.slug}` },
        ]}
      />
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <ProductImage product={product} className="h-40 w-40 sm:h-48 sm:w-48" />
          {product.imageUrl && product.imageSourceUrl && (
            <p className="mt-1 text-center text-xs text-zinc-400">
              <a href={product.imageSourceUrl} className="hover:underline">
                Foto: {product.brand}
              </a>
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-zinc-700">{product.summary}</p>
        </div>
      </div>

      <p className="mt-6 text-2xl font-bold">€{product.priceIndicativeEur.value.toFixed(2)}</p>
      <div className="mt-1">
        <ProductNotice />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3">
        <RetailerLinks brand={product.brand} productName={product.name} />
        <ButtonLink href={`/interesse?product=${product.slug}&source=productpagina`} variant="secondary">
          Stel een vraag
        </ButtonLink>
      </div>

      <h2 className="mt-10 text-xl font-bold">Sterke punten &amp; aandachtspunten</h2>
      <div className="mt-4">
        <ProductProsAndCons product={product} />
      </div>

      <h2 className="mt-10 text-xl font-bold">Specificaties</h2>
      <div className="mt-4">
        <ProductSpecTable product={product} />
      </div>

      <ProductFitAndSources product={product} />

      <p className="mt-6 text-sm">
        <Link href={`/vergelijk?a=${product.slug}`} className="font-semibold text-emerald-800 hover:underline">
          Vergelijk deze stick met een andere
        </Link>
      </p>
    </div>
  );
}
