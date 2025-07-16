"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TransparentCard from "@/components/ui/transparentCard";
import { useTransactions } from "@/context/TransactionsContext";
import { formatDateHuman } from "@/utils/utils";
import { useCategoryMap } from "@/context/CategoryMapContext";
import {
  buildChartConfig,
  ExtendableChartConfig,
} from "../InteractiveTransactionArea/TransactionComposedChart";
import usePieChartData from "./hooks/usePieChartData";
import { useIsMobile } from "@/hooks/useIsMobile";

export function SpendPieChart() {
  const id = "pie-interactive";
  const { displayedTransactions, activeGraphFilters } = useTransactions();
  const { categoryMap } = useCategoryMap();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>();
  const [transientIndex, setTransientIndex] = React.useState<
    number | undefined
  >();
  const { dataTableEntries } = usePieChartData("Expense");

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

  const onPieSectorTap = (index: number) => {
    if (activeIndex !== index) {
      setTransientIndex(index);
      return;
    }

    setActiveIndex(index === activeIndex ? undefined : index);
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
  const centerSpend =
    displayIndex !== undefined ? dataTableEntries[displayIndex] : undefined;

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

  const innerRadius = isMobile ? 30 : 50;

  return (
    <TransparentCard data-chart={id}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="w-full flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="truncate whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-full">
            Spending
            {centerSpend?.category !== undefined &&
              ` - ${centerSpend.category}`}
          </CardTitle>
          <CardDescription>{timeRangeDescription}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="w-full h-full flex flex-1 justify-center p-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <PieChart>
            {!isMobile && (
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            )}
            <Pie
              data={dataTableEntries}
              dataKey="amount"
              nameKey="category"
              className="transition-all z-50"
              innerRadius={innerRadius}
              strokeWidth={5}
              activeIndex={activeSectors}
              labelLine={false}
              label={renderCustomLabel}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector
                    {...props}
                    outerRadius={outerRadius + (isMobile ? 3 : 10)}
                  />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + (isMobile ? 12 : 25)}
                    innerRadius={outerRadius + (isMobile ? 5 : 12)}
                  />
                </g>
              )}
              onMouseEnter={onPieEnter}
              onMouseDown={onPieClick}
              onMouseLeave={onPieLeave}
              onTouchStart={(_, index) => onPieSectorTap(index)}
            >
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    "cx" in viewBox &&
                    viewBox.cx &&
                    "cy" in viewBox &&
                    viewBox.cy &&
                    viewBox.outerRadius
                  ) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={
                          isMobile
                            ? viewBox.cy - viewBox.outerRadius - 35
                            : viewBox.cy
                        }
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={
                            isMobile
                              ? viewBox.cy - viewBox.outerRadius - 40
                              : viewBox.cy
                          }
                          className="fill-foreground text-xl font-bold"
                        >
                          {centerSpendAmountFormatted ||
                            totalSpendAmountFormatted}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={
                            isMobile
                              ? viewBox.cy - viewBox.outerRadius + 230
                              : (viewBox.cy || 0) - 140
                          }
                          className="fill-primary text-xl font-bold"
                        >
                          {totalSpendAmountFormatted} Total
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
