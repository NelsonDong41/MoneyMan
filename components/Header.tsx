import Link from "next/link";
import { LayoutDashboard, Table2, User } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import ShinyText from "./ui/shinyText";
import { createClient } from "@/utils/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signInAction, signOutAction } from "@/app/actions";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ProfileDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <User className="cursor-pointer hover:scale-110" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Hey, {user?.email} </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {user ? (
              <form action={signOutAction}>
                <button type="submit" className="w-full h-full">
                  Sign out
                </button>
              </form>
            ) : (
              <form action={signInAction}>
                <button type="submit" className="w-full h-full">
                  Sign in
                </button>
              </form>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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
                <Link href={"/gallery"}>Gallery</Link>
              </>
            )}
          </div>

          <div className="flex gap-5">
            <ThemeSwitcher />
            <ProfileDropdown />
          </div>
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
          <ProfileDropdown />
        </div>
      </nav>
    </>
  );
}
