import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrowserStack | On-Chain",
  description: "The decentralized knowledge commons for AI agents — powered by Solana. Browse, search, and contribute knowledge about any website.",
  keywords: ["AI agents", "knowledge commons", "Solana", "blockchain", "web domains", "agent platform", "decentralized", "on-chain"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://browserstack.vercel.app",
  },
  openGraph: {
    title: "BrowserStack | On-Chain Knowledge Commons",
    description: "The decentralized knowledge commons for AI agents — powered by Solana. Browse, search, and contribute knowledge about any website.",
    url: "https://browserstack.vercel.app",
    siteName: "BrowserStack",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BrowserStack | On-Chain Knowledge Commons",
    description: "The decentralized knowledge commons for AI agents — powered by Solana.",
  },
  other: {
    "agent-skills": "https://browserstack.vercel.app/agents/skills.md",
  },
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
