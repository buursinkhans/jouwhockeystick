import { ButtonLink } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="bg-emerald-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Vind de hockeystick die bij jou past
        </h1>
        <p className="mt-4 max-w-2xl text-emerald-50">
          Beantwoord een paar vragen over je ervaring, spelstijl en budget. De stickwijzer geeft
          een persoonlijk en uitlegbaar advies — met minimaal twee tot drie zichtbare redenen per
          aanbeveling.
        </p>
        <div className="mt-6">
          <ButtonLink href="/stickwijzer" variant="inverse">
            Start de stickwijzer
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
