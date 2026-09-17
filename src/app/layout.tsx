import clsx from "clsx";
import type { Metadata } from "next";
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
    default: "PayLens",
    template: "%s · PayLens",
  },
  description: "Secure, auditable compensation operations for modern HR teams.",
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
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={clsx(geistSans.variable, geistMono.variable, "h-full antialiased")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
