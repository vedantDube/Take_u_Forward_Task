import type { Metadata } from "next";
import { IBM_Plex_Mono, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const displayFont = Playfair_Display({
  variable: "--font-app-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const sansFont = Montserrat({
  variable: "--font-app-sans",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-app-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CalendarFlow - Smart Event Management",
  description: "A polished, interactive calendar with day range selection, integrated notes, and image carousel",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
