import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import SplashCursor from "@/components/ui/splashCursor";
import AuthButton from "@/components/header-auth";
import ClickSpark from "@/components/ui/clickSpark";
import NavMenu from "@/components/NavMenu";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Nelson's MoneyMan",
  description: "Nelson's way of tracking money because money = money = money",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground overflow-x-hidden">
        <SplashCursor />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <NavMenu />

            <div className="flex flex-col p-5 w-full items-center sm:pt-32 mb-40">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
