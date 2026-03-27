import "@/styles/globals.css";
import { type Metadata, type Viewport } from "next";
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
  title: {
    default: "Interview Prep – AI Mock Interviews",
    template: "%s | Interview Prep",
  },
  description:
    "Practice technical, HR, and aptitude interviews with an AI interviewer. Get instant feedback, scores, and improvement tips.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster />
            <SpeedInsights />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
