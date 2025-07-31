import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "react-photo-view/dist/react-photo-view.css";
import SplashCursor from "@/components/ui/splashCursor";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { UserProvider } from "@/context/UserContext";
import { User } from "@supabase/supabase-js";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground overflow-x-hidden">
        <SplashCursor />
        <main className="min-h-screen flex flex-col items-center">
          <Providers user={user}>
            <Header />
            <div className="flex flex-col p-5 w-full items-center sm:pt-32 mb-40">
              {children}
            </div>
          </Providers>
        </main>
      </body>
    </html>
  );
}

function Providers({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider initial={user}>{children}</UserProvider>
    </ThemeProvider>
  );
}
