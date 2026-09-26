import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'jouwhockeystick.nl — vind de hockeystick die bij je past',
    template: '%s | jouwhockeystick.nl',
  },
  description:
    'Doorloop de stickwijzer en krijg een uitlegbaar advies voor een Grays-hockeystick die past bij jouw niveau, spelstijl en budget.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
