"use client";
import Link from "next/link";
import ShinyText from "./ui/shinyText";
import { useUser } from "@/context/UserContext";

export default function NavItems() {
  const { user } = useUser();
  return (
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
  );
}
