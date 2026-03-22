import "@/styles/globals.css";
import { type Metadata } from "next";
import {
  IBM_Plex_Mono,
  Libre_Baskerville,
  Lora,
} from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const fontSans = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Interview Prep",
  description: "Interview Prep",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
