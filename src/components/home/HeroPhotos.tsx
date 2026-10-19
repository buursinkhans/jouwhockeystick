'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dribbel from '@/assets/home/hero-speelster.jpg';
import slag from '@/assets/home/hero-speelster-slag.jpg';

/**
 * Photos of a youth player (the owner's daughter, published with consent;
 * metadata stripped), both cropped square so they line up. Cross-fades every
 * few seconds; a pause button is always there (WCAG 2.2.2), and with
 * prefers-reduced-motion nothing moves on its own.
 */
const PHOTOS = [
  {
    src: dribbel,
    alt: 'Jeugdspeelster dribbelt met de bal op een kunstgrasveld',
  },
  {
    src: slag,
    alt: 'Jeugdspeelster slaat de bal laag door haar knieën op een kunstgrasveld',
  },
];

const INTERVAL_MS = 6000;

export function HeroPhotos() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const playing = !paused && !reducedMotion;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % PHOTOS.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div
      role="group"
      aria-roledescription="carrousel"
      aria-label="Foto's van een jeugdspeelster"
      className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-sm"
    >
      {PHOTOS.map((photo, i) => (
        <Image
          key={photo.alt}
          src={photo.src}
          alt={photo.alt}
          priority={i === 0}
          placeholder="blur"
          sizes="(min-width: 768px) 384px, 320px"
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-inkt/60 p-1 backdrop-blur-sm">
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.alt}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Foto ${i + 1} van ${PHOTOS.length} tonen`}
            aria-current={i === index}
            className="flex h-11 w-7 items-center justify-center"
          >
            <span
              className={`block h-2.5 w-2.5 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          </button>
        ))}
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Foto’s laten wisselen' : 'Foto’s pauzeren'}
            className="flex h-11 w-11 items-center justify-center text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              {paused ? (
                <path d="M8 5v14l11-7z" />
              ) : (
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
