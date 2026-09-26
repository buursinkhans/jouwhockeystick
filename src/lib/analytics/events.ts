export type AnalyticsEvent =
  | { name: 'quiz_start' }
  | {
      name: 'quiz_complete';
      ruleSetVersion: string;
      hasRecommendation: boolean;
      isUncertain: boolean;
    }
  | { name: 'interest_submit'; source: string; hasProductSlug: boolean };
