import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import ClientInit from "./ClientInit";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Taco Bell AI Drive-Through",
  description: "Order your favorite Taco Bell items with AI voice assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--void)]">
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased bg-[var(--void)]`}>
        <Providers>
          <ClientInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
