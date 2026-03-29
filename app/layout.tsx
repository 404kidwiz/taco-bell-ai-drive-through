import type { Metadata } from "next";
import "./globals.css";
import ClientInit from "./ClientInit";
import { Providers } from "./providers";

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" style={{ backgroundColor: '#151022' }}>
        <Providers>
          <ClientInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
