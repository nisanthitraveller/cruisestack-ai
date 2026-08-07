import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cruisestack AI",
  description: "Dummy Next.js project scaffolded with TypeScript and the App Router.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>{children}</body>
    </html>
  );
}
