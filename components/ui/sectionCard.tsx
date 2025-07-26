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
import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";

type SectionCardProps = {
  title: string;
  description: string;
  value?: number;
  isMoreBetter?: boolean;
};
export default function SectionCard({
  title,
  description,
  value,
  isMoreBetter = true,
}: SectionCardProps) {
  const determinePositiveConstant = isMoreBetter ? 1 : -1;
  let trendingIcon = <TrendingUpDown />;
  let trendingDescription = "the same";
  let colorIndication =
    value && value * determinePositiveConstant < 0
      ? "text-red-500"
      : "text-green-500";

  if (value && value > 0) {
    trendingIcon = <TrendingUp className={colorIndication} />;
    trendingDescription = "trending upwards";
  }
  if (value && value < 0) {
    trendingIcon = <TrendingDown className={colorIndication} />;
    trendingDescription = "trending downwards";
  }
  return (
    <TransparentCard className="@container/card h-full">
      <CardHeader>
        <CardDescription className={"flex justify-between"}>
          {description}{" "}
          <Badge
            variant="outline"
            className={cn(
              "flex justify-center items-center h-full",
              colorIndication
            )}
          >
            +
            {value
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value)
              : " --.-- "}
            %{trendingIcon}
          </Badge>
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-row items-center text-sm">
        The {description} is
        <strong className="pl-1">{trendingDescription}</strong>
        {trendingIcon}
      </CardFooter>
    </TransparentCard>
  );
}
