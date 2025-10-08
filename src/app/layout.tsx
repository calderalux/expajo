import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import { ClientProviders } from '@/components/providers/ClientProviders';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Expajo - Find Your Perfect Short-Term Rental',
  description:
    'Discover amazing short-term rental properties for your next adventure. Book with confidence and experience the best of every destination.',
  keywords: [
    'short-term rental',
    'vacation rental',
    'booking',
    'travel',
    'accommodation',
  ],
  authors: [{ name: 'Expajo Team' }],
  openGraph: {
    title: 'Expajo - Find Your Perfect Short-Term Rental',
    description:
      'Discover amazing short-term rental properties for your next adventure.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expajo - Find Your Perfect Short-Term Rental',
    description:
      'Discover amazing short-term rental properties for your next adventure.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-lato antialiased" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
