import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Spline_Sans, Spline_Sans_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PepTickr",
  description:
    "Track real-time stock prices, get personalized alerts, and explore detailed company insights.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          splineSans.variable,
          splineMono.variable,
          "font-sans antialiased",
        )}
      >
        <main>{children}</main>

        <Toaster richColors />
      </body>
    </html>
  );
}
