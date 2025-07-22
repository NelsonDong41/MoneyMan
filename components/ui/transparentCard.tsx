import {
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactNode,
  RefAttributes,
} from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export default function TransparentCard({
  children,
  ...props
}: {
  children: ReactNode;
} & Partial<
  ForwardRefExoticComponent<
    HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>
  >
>) {
  return (
    <Card
      className={cn(
        "@container/card mx-auto relativerounded-xl backdrop-blur-3xl w-full flex flex-col h-full border bg-popover/80 border-white/25 shadow-lg"
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
