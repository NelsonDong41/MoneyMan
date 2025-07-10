import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import SplashCursor from "@/components/ui/splashCursor";
import AuthButton from "@/components/header-auth";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <SplashCursor />

            <div className="flex-1 w-full flex flex-col sm:gap-10 items-center">
              <nav className="z-50 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>MoneyMan</Link>
                  </div>
                  <AuthButton />
                </div>
              </nav>
              <div className="flex flex-col gap-20 p-5 w-full items-center">
                {children}
              </div>

              <footer className="w-full flex flex-col-reverse sm:flex-row items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16 bg-background">
                <p>
                  Powered by{" "}
                  <a className="font-bold hover:cursor-pointer">
                    THE ONE AND ONLY Nelson
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
