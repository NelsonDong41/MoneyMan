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
export default function pSectionCard({
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
    <TransparentCard className="@container/card h-full pt-4">
      <CardHeader>
        <CardDescription
          className={"flex justify-between p-0 sm:flex-row flex-col"}
        >
          {description}{" "}
          <Badge
            variant="outline"
            className={cn(
              "flex justify-center items-center h-fit p-3 text-sm sm:px-2 sm:py-0 sm:text-xs",
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
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl pt-3">
          {title}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-row items-center text-sm p-0 flex justify-between px-5">
        The {description} is {trendingDescription}
        {trendingIcon}
      </CardFooter>
    </TransparentCard>
  );
}
