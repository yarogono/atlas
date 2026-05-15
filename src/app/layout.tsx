import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Atlas',
    default: 'Atlas - A modern MDX blog',
  },
  description: 'A modern, interactive blog built with Next.js, MDX, and Tailwind CSS.',
  openGraph: {
    title: 'Atlas - A modern MDX blog',
    description: 'A modern, interactive blog built with Next.js, MDX, and Tailwind CSS.',
    url: 'https://atlas-blog.com',
    siteName: 'Atlas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas - A modern MDX blog',
    description: 'A modern, interactive blog built with Next.js, MDX, and Tailwind CSS.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script Placeholder */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50`}>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-3xl font-bold tracking-tight">Atlas</h1>
            <p className="text-slate-500 dark:text-slate-400">The authoritative journal.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
