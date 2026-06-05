import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "8BPOS – Sistem Billing Biliar",
  description: "Point of Sale untuk usaha biliar",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
