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
      /** Direct product page or a search; to compare their conversion. */
      linkType: 'product' | 'search';
      /** In "Waar te koop": place in the sorted list (1 = top), number of shops, and whether an amount was shown. */
      position?: number;
      offerCount?: number;
      priceShown?: boolean;
    }
  | {
      /** The "Waar te koop" block came into view (once per page view and placement). */
      name: 'offer_block_view';
      placement: string;
      offerCount: number;
      /** Shops in the block with a current price. */
      pricedCount: number;
    }
  | {
      /** The short indoor selector on /zaalsticks; no personal data. */
      name: 'indoor_selection';
      player: string;
      budget: string;
      sizes: string;
      resultCount: number;
    }
  | {
      /** A click in a homepage block under the hero, to see what it adds to the funnel. */
      name: 'home_block_click';
      /** 'hero' = the photo with the example reasons (2026-10-22). */
      block: 'season' | 'buying' | 'hero';
      target: string;
    }
  | {
      /**
       * A click in a content block on a catalog page (2026-10-23: the
       * landing blocks on /sticks), like home_block_click for the homepage.
       */
      name: 'catalog_block_click';
      page: 'sticks' | 'zaalsticks';
      /** 'aanbod' = the button that loads the imported PassaHockey sticks (target 'aanbod-laden'). */
      block: 'intro' | 'levels' | 'faq' | 'aanbod';
      target: string;
    }
  | {
      /** A choice in an explainer figure in an article (e.g. the bow profiles). */
      name: 'figure_interaction';
      figure: 'bow-profiles';
      option: string;
    }
  | {
      /** The folded optional questions on a stickwijzer screen were opened. */
      name: 'optional_questions_open';
      screen: string;
    }
  | {
      /** "Deel dit advies": shared via the share sheet or copied link. */
      name: 'advice_shared';
      method: 'native' | 'copy';
    }
  | {
      /** A shared advice link was opened; `changed` = sticks differ since sharing. */
      name: 'shared_advice_opened';
      changed: boolean;
    }
  | AdviceAnalyticsEvent;
