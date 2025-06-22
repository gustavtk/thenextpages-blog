import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans"
});

export const metadata: Metadata = {
  title: "The Next Pages - Practical Lifehacks for Better Living",
  description: "At thenextpages, we craft info-dense content that empowers everyday living. Our focus is on practical lifehacks—carefully researched, clearly explained, and designed to make your life simpler, smarter, and more efficient.",
  keywords: "lifehacks, productivity tips, DIY solutions, practical guides, better living, life tips, efficiency, smart living",
  authors: [{ name: "The Next Pages" }],
  robots: "index, follow",
  openGraph: {
    title: "The Next Pages - Practical Lifehacks for Better Living",
    description: "At thenextpages, we craft info-dense content that empowers everyday living. Our focus is on practical lifehacks—carefully researched, clearly explained, and designed to make your life simpler, smarter, and more efficient.",
    type: "website",
    locale: "en_US",
    siteName: "TheNextPages",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Next Pages - Practical Lifehacks for Better Living",
    description: "At thenextpages, we craft info-dense content that empowers everyday living. Our focus is on practical lifehacks—carefully researched, clearly explained, and designed to make your life simpler, smarter, and more efficient.",
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://thenextpages.com/" />
        <meta name="theme-color" content="#4285f4" />
        

      </head>
      <body className={`${dmSans.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
