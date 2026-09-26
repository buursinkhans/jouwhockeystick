import type { ReasonCode } from './types';

/** Dutch, nuanced explanations shown in the UI for each reason code. */
export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  EXPERIENCE_MATCH: 'Past bij jouw opgegeven ervaringsniveau',
  PLAYSTYLE_MATCH: 'Sluit aan bij de spelacties die je belangrijk vindt',
  COMFORT_MATCH: 'Sluit aan bij jouw voorkeur voor gewicht en gevoel',
  BUDGET_FIT: 'Past ruim binnen je opgegeven budget',
  POSITION_ALIGNMENT: 'Wordt vaker gebruikt door spelers op jouw positie',
  UPGRADE_PATH: 'Kan een logische stap zijn als je al ervaring hebt met een stick',
  STOCK_AVAILABLE: 'Momenteel gemarkeerd als beschikbaar',
};
