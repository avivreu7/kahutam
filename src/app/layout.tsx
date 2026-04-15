import type { Metadata, Viewport } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "קהוטם – משחק טריוויה",
  description: "משחק טריוויה בזמן אמת",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-assistant bg-slate-50 text-slate-900 select-none">
        {children}
      </body>
    </html>
  );
}
