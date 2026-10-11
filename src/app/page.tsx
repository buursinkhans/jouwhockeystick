import { HomePage } from '@/components/home/HomePage';
import { HOME_INTRO_VARIANT } from '@/content/home';

// Rebuilt daily so the seasonal band switches on and off without a deploy.
export const revalidate = 86400;

export default function Home() {
  return <HomePage variant={HOME_INTRO_VARIANT} />;
}
