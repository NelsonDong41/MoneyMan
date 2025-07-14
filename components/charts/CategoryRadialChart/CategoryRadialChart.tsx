"use client";

import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TransparentCard from "../../ui/transparentCard";

export const description = "A radar chart with a custom grid";

export type CategoryRadialChartDataEntry = {
  category: string;
  percentSpent: number;
};

const chartData: CategoryRadialChartDataEntry[] = [
  { category: "Food", percentSpent: 10 },
  { category: "Gym", percentSpent: 30 },
  { category: "Clothes", percentSpent: 80 },
  { category: "Rent", percentSpent: 110 },
];

const chartConfig = {
  category: {
    label: "Cateogry",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CategoryRadialChart() {
  return (
    <div className="w-full h-full ">
      <TransparentCard>
        <CardHeader className="items-center">
          <CardTitle>Radar Chart - Grid Custom</CardTitle>
          <CardDescription>
            Showing total visitors for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0 h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar
                  name="category"
                  dataKey="percentSpent"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        });
                      }}
                      indicator="line"
                    />
                  }
                />
              </RadarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground flex items-center gap-2 leading-none">
            January - June 2024
          </div>
        </CardFooter>
      </TransparentCard>
    </div>
  );
}
