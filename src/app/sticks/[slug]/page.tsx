import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { ProductSpecTable } from '@/components/catalog/ProductSpecTable';
import { ProductProsAndCons } from '@/components/catalog/ProductProsAndCons';
import { StickIllustration } from '@/components/catalog/StickIllustration';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { ButtonLink } from '@/components/ui/Button';
import { BolComLink } from '@/components/ui/BolComLink';

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
  return {
    title: product.name,
    description: product.summary,
  };
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
      <div className="flex items-start gap-6">
        <StickIllustration
          brand={product.brand}
          bowProfile={product.bowProfile?.value}
          alt={product.imageAlt}
          className="h-28 w-28 shrink-0"
        />
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

      <div className="mt-6 flex flex-wrap gap-3">
        <BolComLink brand={product.brand} productName={product.name} variant="primary">
          Bekijk op bol.com
        </BolComLink>
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

      <p className="mt-6 text-sm">
        <Link href={`/vergelijk?a=${product.slug}`} className="font-semibold text-emerald-800 hover:underline">
          Vergelijk deze stick met een andere
        </Link>
      </p>
    </div>
  );
}
