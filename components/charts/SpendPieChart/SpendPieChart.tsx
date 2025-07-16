"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransparentCard from "@/components/ui/transparentCard";
import { useTransactions } from "@/context/TransactionsContext";
import { formatDateHuman } from "@/utils/utils";
import { useCategoryMap } from "@/context/CategoryMapContext";
import {
  buildChartConfig,
  ExtendableChartConfig,
} from "../InteractiveTransactionArea/TransactionComposedChart";
import useSpendPieChartData from "./hooks/useSpendPieChartData";

export const description = "An interactive pie chart";

const desktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
];

export function SpendPieChart() {
  const id = "pie-interactive";
  const { displayedTransactions, activeGraphFilters } = useTransactions();
  const { categoryMap } = useCategoryMap();
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>();
  const [transientIndex, setTransientIndex] = React.useState<
    number | undefined
  >();
  const { dataTableEntries } = useSpendPieChartData();

  const onPieEnter = (_: any, index: number) => {
    setTransientIndex(index);
  };

  const onPieLeave = () => {
    setTransientIndex(undefined);
  };

  const onPieClick = (_: any, index: number) => {
    setActiveIndex((prev) => (index === prev ? undefined : index));
    setTransientIndex(undefined);
  };

  let activeSectors: number[] = [];

  if (activeIndex !== undefined) activeSectors.push(activeIndex);
  if (transientIndex !== undefined) activeSectors.push(transientIndex);

  const totalSpend = React.useMemo(
    () =>
      displayedTransactions.reduce((prev, curr) => {
        if (curr.type === "Income" || curr.status === "Canceled") return prev;
        return prev + curr.amount;
      }, 0),
    [displayedTransactions]
  );

  const totalSpendAmountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalSpend);

  const displayIndex = transientIndex ?? activeIndex;
  const centerSpend = displayIndex ? dataTableEntries[displayIndex] : undefined;

  const centerSpendAmountFormatted =
    centerSpend &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(centerSpend.amount);

  const timeRangeDescription = `${formatDateHuman(
    new Date(activeGraphFilters.timeRange[0])
  )} - ${formatDateHuman(new Date(activeGraphFilters.timeRange[1]))}`;

  const categoryConfigObj = buildChartConfig(
    Object.keys(categoryMap["Expense"])
  );

  const chartConfig: ExtendableChartConfig = categoryConfigObj;

  console.log(chartConfig);

  return (
    <TransparentCard data-chart={id}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="w-full flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>
            Spending {centerSpend?.category && ` - ${centerSpend.category}`}
          </CardTitle>
          <CardDescription>{timeRangeDescription}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="w-full h-full flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataTableEntries}
              dataKey="amount"
              nameKey="category"
              className="transition-all"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeSectors}
              labelLine={false}
              label={renderCustomLabel}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
              onMouseEnter={onPieEnter}
              onMouseDown={onPieClick}
              onMouseLeave={onPieLeave}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {centerSpendAmountFormatted ||
                            totalSpendAmountFormatted}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          of {totalSpendAmountFormatted}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </TransparentCard>
  );
}

function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } =
    props;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
      style={{ pointerEvents: "none" }}
    >
      {name}
    </text>
  );
}
