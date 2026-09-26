import type { Metadata } from 'next';
import { getProductBySlug } from '@/catalog';
import { interestSourceSchema } from '@/interest/types';
import { InterestForm } from '@/components/interesse/InterestForm';

export const metadata: Metadata = {
  title: 'Interesse doorgeven',
  description: 'Geef je interesse door en we nemen contact met je op.',
};

export default async function InteressePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; source?: string }>;
}) {
  const params = await searchParams;
  const product = params.product ? getProductBySlug(params.product) : undefined;
  const parsedSource = interestSourceSchema.safeParse(params.source);
  const source = parsedSource.success ? parsedSource.data : 'algemeen';

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Interesse doorgeven</h1>
      <p className="mt-2 text-zinc-600">
        {product ? `Je geeft interesse door voor de ${product.name}. ` : ''}
        We nemen contact met je op om je verder te helpen.
      </p>
      <div className="mt-8">
        <InterestForm initialProductSlug={product?.slug} source={source} />
      </div>
    </div>
  );
}
