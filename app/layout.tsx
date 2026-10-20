import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { readLegacyPage } from "@/lib/legacy-page";

export function generateMetadata(): Metadata {
  const { title, description } = readLegacyPage();
  return { title, description, icons: { icon: "/assets/matrimony-app-icon.png?v=3", apple: "/assets/apple-touch-icon.png?v=3" } };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010101"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { stylesheets } = readLegacyPage();
  return (
    // The legacy app sets <html lang> to the chosen language before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Legacy relative URLs (./assets, ./app.js) must resolve from the root, including on /weddings/*. */}
        <base href="/" />
        {stylesheets.map((href) => <link key={href} rel="stylesheet" href={href} />)}
      </head>
      {/* The legacy scripts add classes such as portal-mode to <body> before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
