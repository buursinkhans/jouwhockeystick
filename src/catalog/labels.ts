import type { BowProfile, Product } from './types';

export const EXPERIENCE_LABELS: Record<Product['experienceLevel']['value'], string> = {
  beginner: 'Beginner',
  gevorderd: 'Gevorderd',
  ervaren: 'Ervaren',
};

export const BOW_LABELS: Record<BowProfile, string> = {
  ultrabow: 'Ultrabow / standaard',
  midbow: 'Mid bow',
  dynabow: 'Dynabow',
  probow: 'Pro bow',
  lowbow: 'Low bow',
  extreme_lowbow: 'Extreme low bow',
};

export const STOCK_LABELS: Record<Product['stock']['value'], string> = {
  available: 'Beschikbaar',
  limited: 'Beperkt beschikbaar',
  unavailable: 'Niet beschikbaar',
};

export const POSITION_LABELS: Record<string, string> = {
  keeper: 'Keeper',
  verdediger: 'Verdediger',
  middenvelder: 'Middenvelder',
  aanvaller: 'Aanvaller',
};
