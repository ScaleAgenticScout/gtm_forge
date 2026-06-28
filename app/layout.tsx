import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTMForge — Forge production GTM workflows",
  description:
    "Forge turns messy one-off GTM automations into production-ready, shareable, monitored revenue workflow packages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
