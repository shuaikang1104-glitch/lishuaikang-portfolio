import type { Metadata } from "next";
import { Blinker, Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blinker = Blinker({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-blinker",
  display: "swap",
});

/** 中文标题与长文：Noto Serif SC（与 Geist 分工） */
const notoSerifSC = Noto_Serif_SC({
  weight: ["300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  fallback: ["Songti SC", "PingFang SC", "STSong", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shuaikangstudio.cn"),
  title: "李帅康 — Visual design",
  description: "Brand, campaign, and operational design.",
  openGraph: {
    type: "website",
    title: "李帅康 — Visual design",
    description: "Brand, campaign, and operational design.",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "李帅康 — Visual design 作品集分享封面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "李帅康 — Visual design",
    description: "Brand, campaign, and operational design.",
    images: ["/og-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hans"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} ${blinker.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
