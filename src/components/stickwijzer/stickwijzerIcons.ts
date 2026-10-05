import type { ComponentType, SVGProps } from 'react';
import {
  BallIcon,
  BoltIcon,
  EuroIcon,
  FeelIcon,
  RulerIcon,
  SproutIcon,
  StepsIcon,
  StickIcon,
  TargetIcon,
  UserIcon,
} from '@/components/ui/icons';

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number }
>;

/** Icon per route option value (route_self_select). */
export const ROUTE_OPTION_ICONS: Record<string, IconComponent> = {
  first_stick: SproutIcon,
  next_stick: StepsIcon,
  advanced_compare: TargetIcon,
};

/** Icon per wizard screen id, shown next to the screen title. */
export const SCREEN_ICONS: Record<string, IconComponent> = {
  who: UserIcon,
  age_experience: StepsIcon,
  height: RulerIcon,
  first_touch: BallIcon,
  core_skills: SproutIcon,
  goals: TargetIcon,
  fun: BallIcon,
  match_actions: BoltIcon,
  skills_ground: StickIcon,
  skills_special: BoltIcon,
  feel: FeelIcon,
  current_stick: StickIcon,
  budget: EuroIcon,
};
