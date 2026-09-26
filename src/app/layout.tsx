import type { Metadata } from "next";
import {
  Montserrat,
  Plus_Jakarta_Sans,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://imagineinteriors.design";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Imagine Interiors — Interior Design Firm in Dhaka, Bangladesh",
    template: "%s — Imagine Interiors",
  },
  description:
    "Internationally recognized interior design firm in Dhaka, Bangladesh. Residential, commercial, hospitality and duplex interior design — from consultation to turnkey handover since 2015.",
  keywords: [
    "interior design Bangladesh",
    "interior design company Dhaka",
    "office interior design",
    "home interior design Dhaka",
    "duplex house design",
    "restaurant interior design",
  ],
  openGraph: {
    type: "website",
    siteName: "Imagine Interiors",
    url: SITE_URL,
    title: "Imagine Interiors — Interior Design Firm in Dhaka, Bangladesh",
    description:
      "Cinematic spaces, bespoke materiality, and mindful spatial living — explore 35+ projects across residences, offices, and hospitality.",
    images: [
      {
        url: "/projects/mrs-sen-banani/photo-01.jpg",
        width: 945,
        height: 632,
        alt: "Imagine Interiors — residential interior project",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imagine Interiors — Interior Design Firm in Dhaka, Bangladesh",
    description:
      "Internationally recognized interior design firm in Dhaka, Bangladesh. Residential, commercial, hospitality and duplex interior design.",
    images: ["/projects/mrs-sen-banani/photo-01.jpg"],
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
  return (      <html
      lang="en"
      className={`${montserrat.variable} ${plusJakartaSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#E5E5E5] text-[#222222] font-sans overflow-x-hidden selection:bg-[#333333] selection:text-white">
        {children}
      </body>
    </html>
  );
}
