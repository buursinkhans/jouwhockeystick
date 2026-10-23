import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getAllProducts, isFeedImport } from '@/catalog';
import { PRODUCT_SECTIONS } from '@/catalog/paths';
import { resolveProductRoute } from '@/catalog/productRoute';
import {
  ProductDetail,
  productPageMetadata,
} from '@/components/catalog/ProductDetail';

const SECTION = PRODUCT_SECTIONS.curated;

/** Prebuilt: the sticks that belong here. Other slugs redirect or 404 on demand. */
export function generateStaticParams() {
  return getAllProducts(new Date(), { includeImported: true })
    .filter((product) => !isFeedImport(product))
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const route = resolveProductRoute((await params).slug, SECTION);
  return route.kind === 'page' ? productPageMetadata(route.product) : {};
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const route = resolveProductRoute((await params).slug, SECTION);
  if (route.kind === 'not-found') notFound();
  // 308: a stick that changed place (imported ↔ kept by hand) keeps its links.
  if (route.kind === 'redirect') permanentRedirect(route.to);
  return <ProductDetail product={route.product} />;
}
