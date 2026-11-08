/**
 * Technical terms in plain words (UX phase 1, 2026-11-08), for parents and
 * beginners. Each line repeats what our checked articles say, hedged where
 * they hedge ("meestal"): no absolute claims, and carbon is not a stiffness
 * measurement (decision log 2026-11-08).
 */
export const TERMS = {
  bow: {
    term: 'Bow-profiel',
    plain: 'Waar de kromming zit. Een hogere kromming (mid bow) is rustig bij aannemen en passen; een lagere (low bow) helpt bij liften en 3D, maar vraagt meer techniek.',
    href: '/kennis/low-bow-vs-mid-bow',
  },
  carbon: {
    term: 'Carbon',
    plain: 'Meer carbon maakt een stick meestal stijver en directer; minder carbon vergeeft meer als je de bal net niet goed raakt.',
    href: '/kennis/meer-carbon-hockeystick-beter',
  },
  level: {
    term: 'Ervaringsniveau',
    plain: 'Voor welke spelers het merk of de winkel de stick bedoelt, of wij dat inschatten.',
    href: '/methodiek',
  },
} as const;

export type TermKey = keyof typeof TERMS;
