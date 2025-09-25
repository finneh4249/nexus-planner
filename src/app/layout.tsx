import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Nexus - Your Financial Co-op Coach',
  description: 'Ruthlessly simple. Adaptive. Couple-first. Build your financial future together.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700;800&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full dark">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
