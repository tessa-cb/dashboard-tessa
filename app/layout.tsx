import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Tessa",
  description: "Iterative personal dashboard (Tessa)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="ui-preferences-init" strategy="beforeInteractive">{`
(() => {
  try {
    var el = document.documentElement;
    var theme = localStorage.getItem("dashboard-tessa:theme");
    if (theme && theme !== "system") el.setAttribute("data-theme", theme);
    else el.removeAttribute("data-theme");

    var density = localStorage.getItem("dashboard-tessa:density");
    if (density === "compact") el.classList.add("compact");
    else el.classList.remove("compact");
  } catch (_) {}
})();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
