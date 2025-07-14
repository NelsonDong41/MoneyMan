import { ReactNode } from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export default function TransparentCard({
  children,
  transparent = false,
}: {
  children: ReactNode;
  transparent?: boolean;
}) {
  const transparentCss = transparent
    ? "backdrop-blur-2xl bg-transparant"
    : "backdrop-blur-3xl";
  return (
    <Card
      className={cn(
        "@container/card mx-auto relativerounded-xl w-full flex flex-col h-full border bg-popover/80 border-white/25 shadow-lg",
        transparentCss
      )}
    >
      {children}
    </Card>
  );
}
