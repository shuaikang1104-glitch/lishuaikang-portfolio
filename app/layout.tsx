import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  title: "李帅康 — Visual design",
  description: "Brand, campaign, and operational design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hans"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[#010101] font-sans text-zinc-100">
        {children}
      </body>
    </html>
  );
}
