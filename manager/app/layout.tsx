import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BoardHub - Project Management',
  description: 'Organize and manage your projects efficiently with BoardHub, a modern Kanban board application.',
  icons: {
    icon: [
      { url: '/layers.png', type: 'image/x-icon' },
      { url: '/layers.png', sizes: '16x16', type: 'image/png' },
      { url: '/layers.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/layers.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#0d9488',
  viewport: 'width=device-width, initial-scale=1.0',
  keywords: ['project management', 'kanban', 'trello', 'boardhub', 'task management', 'collaboration'],
  authors: [{ name: 'Abdul Ahad' }],
  openGraph: {
    title: 'BoardHub - Project Management',
    description: 'Collaborate and organize your projects with BoardHub’s intuitive Kanban boards.',
    url: 'https://www.boardhub.app',
    siteName: 'BoardHub',
    images: [
      {
        url: '/layers.png',
        width: 1200,
        height: 630,
        alt: 'BoardHub Kanban Board',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BoardHub - Project Management',
    description: 'Organize your projects with BoardHub’s powerful Kanban boards.',
    images: ['/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-teal-50 via-white to-cyan-50`}>
        {children}
      </body>
    </html>
  );
}