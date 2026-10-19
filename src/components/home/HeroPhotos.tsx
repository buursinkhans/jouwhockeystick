'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dribbel from '@/assets/home/hero-speelster.jpg';
import slag from '@/assets/home/hero-speelster-slag.jpg';

/**
 * Photos of a youth player (the owner's daughter, published with consent;
 * metadata stripped), both cropped square so they line up. Cross-fades every
 * 10 seconds, without buttons: the point is that something happens on the
 * homepage (owner's choice, decision log 2026-10-19). Instead of a pause
 * button it pauses on hover, stops after three rounds, and with
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

const INTERVAL_MS = 10_000;
/** Stop rotating after this many full rounds, so it doesn't keep distracting. */
const MAX_ROUNDS = 3;

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

  const [steps, setSteps] = useState(0);
  const finished = steps >= MAX_ROUNDS * PHOTOS.length;
  const playing = !paused && !reducedMotion && !finished;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length);
      setSteps((n) => n + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div
      data-hero-photos
      className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
    </div>
  );
}
