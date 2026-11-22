import { createContext, useContext } from 'react';

/**
 * The series comparison a shop button sits in (wave 1, 2026-11-22): its slug,
 * so a click can also be counted as `versus_retailer_click` for that series.
 * Null on every other page. No personal data: the slug of a public page.
 */
export const VersusReeks = createContext<string | null>(null);

export const useVersusReeks = (): string | null => useContext(VersusReeks);
