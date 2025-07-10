import { ReactNode } from "react";
import { Card } from "./card";

export default function TransparentCard({ children }: { children: ReactNode }) {
  return (
    <Card className="@container/card mx-auto  relative bg-popover/80 backdrop-blur-3xl rounded-xl border border-white/25 shadow-lg p-1 w-full flex flex-col h-full">
      {children}
    </Card>
  );
}
