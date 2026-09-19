import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/assets/style/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "PayLens — Compensation Intelligence",
    template: "%s · PayLens",
  },
  description: "Turn compensation data into clear decisions, fair growth, and stronger teams.",
  icons: { icon: "/brand/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#FFFFFF", media: "(prefers-color-scheme: light)" },
    { color: "#010120", media: "(prefers-color-scheme: dark)" },
  ],
};

const themeScript = `
(function () {
  try {
    var value = localStorage.getItem("paylens-theme");
    var parsed = value ? JSON.parse(value) : null;
    var theme = parsed && parsed.state && parsed.state.theme;
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={clsx(geistSans.variable, geistMono.variable, "h-full antialiased")}
    >
      <body className="flex min-h-full flex-col">
        <Script id="paylens-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
