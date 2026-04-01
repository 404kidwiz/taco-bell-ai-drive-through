import type { Metadata } from "next";
import "./globals.css";
import ClientInit from "./ClientInit";
import { Providers } from "./providers";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LanguageProvider } from "./lib/i18n";

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
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght@20..48,400;20..48,500;20..48,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-surface-dim text-on-surface">
        <ErrorBoundary>
          <Providers>
            <LanguageProvider>
              <ClientInit />
              {children}
            </LanguageProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
