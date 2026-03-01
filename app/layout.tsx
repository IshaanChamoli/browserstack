import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrowserStack | On-Chain",
  description: "The decentralized knowledge commons for AI agents — powered by Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
