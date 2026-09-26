import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { ProductSpecTable } from '@/components/catalog/ProductSpecTable';
import { ProductProsAndCons } from '@/components/catalog/ProductProsAndCons';
import { StickIllustration } from '@/components/catalog/StickIllustration';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { ButtonLink } from '@/components/ui/Button';

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
  // page, and deliberately omits `offers`/price since there is no live
  // partner-shop feed yet (source-policy.md §6).
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
          bowProfile={product.bowProfile.value}
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
        <ProductNotice product={product} />
      </div>

      <div className="mt-6">
        <ButtonLink href={`/interesse?product=${product.slug}&source=productpagina`}>
          Ik heb interesse in deze stick
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
    </div>
  );
}
