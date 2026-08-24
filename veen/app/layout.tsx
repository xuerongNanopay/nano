import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Veen — Back-Office Operations Control",
  description: "Automated multi-source reconciliation, exception management, and operational control reporting for payment operations.",
  openGraph: {
    title: "Veen — Back-Office Operations Control",
    description: "Automated multi-source reconciliation, exception management, and operational control reporting for payment operations.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Veen reconciliation operations dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veen — Back-Office Operations Control",
    description: "Automated multi-source reconciliation, exception management, and operational control reporting for payment operations.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
