import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CalculatorModal } from "@/components/calculator/CalculatorModal";

const aiaEverest = localFont({
  src: [
    {
      path: "../Fonts/AIAEverest-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../Fonts/AIAEverest-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../Fonts/AIAEverest-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
        path: "../Fonts/AIAEverest-CondensedMedium.ttf",
        weight: "500",
        style: "condensed",
    }
  ],
  variable: "--font-aia",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://foundation30.com'),
  title: "Foundation30 - Bảo hiểm Doanh nghiệp Cao cấp",
  description:
    "Giải pháp bảo hiểm và phúc lợi toàn diện cho doanh nghiệp hiện đại. Bảo vệ đội ngũ nhân viên cốt lõi với các gói bảo hiểm chuyên nghiệp.",
  keywords: ["bảo hiểm doanh nghiệp", "bảo hiểm nhân viên", "phúc lợi doanh nghiệp", "Foundation30", "AIA", "bảo hiểm cao cấp"],
  authors: [{ name: "Foundation30" }],
  creator: "Foundation30",
  publisher: "Foundation30",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  openGraph: {
    title: "Foundation30 - Bảo hiểm Doanh nghiệp Cao cấp",
    description: "Giải pháp bảo hiểm và phúc lợi toàn diện cho doanh nghiệp hiện đại. Bảo vệ đội ngũ nhân viên cốt lõi với các gói bảo hiểm chuyên nghiệp.",
    url: "https://foundation30.com",
    siteName: "Foundation30",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/images/HeroHero.png",
        width: 1200,
        height: 630,
        alt: "Foundation30 - Bảo hiểm Doanh nghiệp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundation30 - Bảo hiểm Doanh nghiệp Cao cấp",
    description: "Giải pháp bảo hiểm và phúc lợi toàn diện cho doanh nghiệp hiện đại.",
    images: ["/images/HeroHero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${aiaEverest.variable} antialiased`}>
        {children}
        <CalculatorModal />
      </body>

    </html>
  );
}
