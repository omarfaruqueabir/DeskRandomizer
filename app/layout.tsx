import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Desk Randomizer",
  description: "Interactive 2D office floor plan — place desks and randomly assign employee names.",
};

const themeScript = `
(function() {
  var key = 'desk-randomizer-theme';
  var stored = localStorage.getItem(key);
  var dark = stored === 'dark' || (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-100 text-stone-900 dark:bg-slate-900 dark:text-slate-100`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
