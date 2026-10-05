import type { AdviceRoute } from '@/advice-engine/answers';

/**
 * Keuzehulp funnel events (implementation spec §10). The spec also lists
 * `advice_product_added_to_cart` and `advice_product_purchased`; those are
 * left out because this site has no cart or checkout to emit them from —
 * `retailer_click` is the closest purchase-intent signal.
 */
export type AdviceEventName =
  | 'advice_started'
  | 'route_selected'
  | 'question_answered'
  | 'advice_completed'
  | 'advice_product_viewed'
  | 'advice_feedback_submitted';

export type AdviceAnalyticsEvent = {
  name: AdviceEventName;
  /** Random per-session id; never linked to a name, e-mail address or account. */
  adviceSessionId: string;
  route?: AdviceRoute;
  questionId?: string;
  answerKey?: string;
  productId?: string;
  timestamp: string;
};

export type AnalyticsEvent =
  | { name: 'quiz_start' }
  | {
      name: 'quiz_complete';
      ruleSetVersion: string;
      hasRecommendation: boolean;
      isUncertain: boolean;
    }
  | { name: 'interest_submit'; source: string; hasProductSlug: boolean }
  | {
      name: 'retailer_click';
      retailer: string;
      brand: string;
      productName: string;
      placement: string;
    }
  | AdviceAnalyticsEvent;
