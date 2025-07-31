import Link from "next/link";
import AuthButton from "./header-auth";
import { LayoutDashboard, Table2 } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import ShinyText from "./ui/shinyText";
import { createClient } from "@/utils/supabase/server";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <nav className="hidden sm:flex fixed z-50 justify-center border-b border-b-foreground/10 top-0 sm:w-full h-20 bg-background w-full items-center">
        <div className="flex w-full max-w-screen-2xl justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link className="text-xl pr-4" href={"/"}>
              <ShinyText className="text-accent-foreground">MoneyMan</ShinyText>
            </Link>
            {user && (
              <>
                <Link href={"/dashboard"}>Dashboard</Link>
                <Link href={"/transactions"}>Transactions</Link>
              </>
            )}
          </div>

          <ThemeSwitcher />
          <AuthButton />
        </div>
      </nav>
      <nav className="flex sm:hidden fixed z-50 justify-center border-t border-t-foreground/10 bottom-0 sm:w-full h-20 px-20 bg-background w-full">
        <div className="flex w-full max-w-screen-2xl justify-between items-center p-3 px-5 text-sm">
          {user && (
            <>
              <Link href={"/dashboard"}>
                <LayoutDashboard />
              </Link>
              <Link href={"/transactions"}>
                <Table2 />
              </Link>
            </>
          )}
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </nav>
    </>
  );
}
