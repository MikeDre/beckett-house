/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import "@photo-sphere-viewer/core/index.css";
import "./globals.css";
import { SITE_URL } from "../lib/seo";
import { LocationSwitcher } from "./location-switcher";

const title = "Beckett House Montessori | Nursery in Angel & Abbey Road";
const description =
  "A warm, family-run Montessori nursery for children from 3 months to 5 years, with settings in Angel, Islington and Abbey Road, St John's Wood.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Beckett House Montessori",
  title: {
    default: title,
    template: "%s | Beckett House Montessori",
  },
  description,
  category: "education",
  creator: "Beckett House Montessori",
  publisher: "Beckett House Montessori",
  referrer: "origin-when-cross-origin",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: "/images/bh-mark.png",
    shortcut: "/images/bh-mark.png",
    apple: "/images/bh-mark.png",
  },
  openGraph: {
    title,
    description,
    url: "https://www.beckett-house.co.uk/",
    siteName: "Beckett House Montessori",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Beckett House Montessori: Room to grow into themselves.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<LocationSwitcher /></body>
    </html>
  );
}
