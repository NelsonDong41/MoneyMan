import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import TransparentCard from "./transparentCard";

type SectionCardProps = {
  title: string;
  description: string;
  badgeValue?: number;
  footer: React.ReactNode;
  color: string;
};
export default function SectionCard({
  title,
  description,
  badgeValue,
  footer,
  color,
}: SectionCardProps) {
  return (
    <TransparentCard className="@container/card h-full pt-4">
      <CardHeader>
        <CardDescription
          className={"flex justify-between p-0 sm:flex-row flex-col"}
        >
          {description}{" "}
          <Badge
            variant="outline"
            className={cn(
              "flex justify-center items-center h-fit p-3 text-sm sm:px-2 sm:py-0 sm:text-xs ",
              `text-${color}-500`
            )}
          >
            {badgeValue && badgeValue < 0 ? "-" : "+"}
            {badgeValue !== undefined
              ? (Math.abs(badgeValue) * 100).toFixed(2) + " %"
              : " --.-- "}
          </Badge>
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl pt-3">
          {title}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-row items-center text-sm p-0 flex justify-between px-5">
        {footer}
      </CardFooter>
    </TransparentCard>
  );
}
