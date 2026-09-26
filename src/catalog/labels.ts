import type { BowProfile, Product } from './types';

export const EXPERIENCE_LABELS: Record<Product['experienceLevel']['value'], string> = {
  beginner: 'Beginner',
  gevorderd: 'Gevorderd',
  ervaren: 'Ervaren',
};

export const BOW_LABELS: Record<BowProfile, string> = {
  'low-bow': 'Low bow',
  'mid-bow': 'Mid bow',
  'late-bow': 'Late bow',
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
