import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { LogIn, LogOut } from "lucide-react";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <>
      <div className="hidden sm:flex items-center gap-4">
        Hey, {user.email}!
        <form action={signOutAction}>
          <Button type="submit" variant={"outline"}>
            Sign out
          </Button>
        </form>
      </div>
      <div className="flex sm:hidden gap-4 h-full">
        <form action={signOutAction} className="p-0 h-full flex items-center">
          <button type="submit">
            <LogOut />
          </button>
        </form>
      </div>
    </>
  ) : (
    <>
      <div className="hidden sm:flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>

      {/* Mobile view */}
      <div className="flex sm:hidden gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/sign-in">
            hi
            <LogIn />
          </Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/sign-up">
            <LogOut />
          </Link>
        </Button>
      </div>
    </>
  );
}
