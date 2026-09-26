import type { Metadata } from 'next';
import { QuizForm } from '@/components/stickwijzer/QuizForm';

export const metadata: Metadata = {
  title: 'Stickwijzer',
  description:
    'Beantwoord een paar vragen over je lengte, ervaring, spelstijl en budget en ontvang een uitlegbaar advies voor een Grays-hockeystick.',
};

export default function StickwijzerPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Stickwijzer</h1>
      <p className="mt-2 text-zinc-600">
        We geven een richting en beschikbare producten — geen garantie. Positie is nooit de enige
        beslisfactor.
      </p>
      <div className="mt-8">
        <QuizForm />
      </div>
    </div>
  );
}
