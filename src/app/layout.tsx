import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const berlingskeSerif = localFont({
  src: [
    {
      path: "../fonts/berlingske/BerlingskeSerif-Bd.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/berlingske/BerlingskeSerif-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

const lotaGrotesque = localFont({
  src: [
    { path: "../fonts/lota-grotesque/LotaGrotesque-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/lota-grotesque/LotaGrotesque-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/lota-grotesque/LotaGrotesque-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s · YuLife",
    default: "YuLife",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={cn("font-sans", berlingskeSerif.variable, lotaGrotesque.variable)}
    >
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
