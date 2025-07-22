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
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTransactions } from "@/context/TransactionsContext";
import { formatDateHuman } from "@/utils/utils";
import { useCategoryMap } from "@/context/CategoryMapContext";
import { buildChartConfig } from "../InteractiveTransactionArea/TransactionComposedChart";
import usePieChartData from "./hooks/usePieChartData";
import { useIsMobile } from "@/hooks/useIsMobile";

const findNumberInArray = (arr: number[], target: number) => {
  return arr.find((curr) => curr === target);
};

export function SpendPieChart() {
  const id = "expense-pie";
  const { displayedTransactions, activeGraphFilters } = useTransactions();
  const { categoryMap } = useCategoryMap();
  const isMobile = useIsMobile();
  const [activeIndicies, setActiveIndicies] = React.useState<number[]>([]);
  const [transientIndex, setTransientIndex] = React.useState<
    number | undefined
  >();
  const { dataTableEntries } = usePieChartData("Expense");

  React.useEffect(() => {
    const foundActiveIndicies: number[] = [];
    activeGraphFilters.categories.forEach((cat) => {
      const index = dataTableEntries.findIndex(
        (currEntry) => currEntry.category === cat
      );
      index !== undefined && index !== -1 && foundActiveIndicies.push(index);
    });

    setActiveIndicies(foundActiveIndicies);
  }, [activeGraphFilters.categories, dataTableEntries]);

  const onPieEnter = (_: any, index: number) => {
    setTransientIndex(index);
  };

  const onPieLeave = () => {
    setTransientIndex(undefined);
  };

  const onPieClick = (_: any, index: number) => {
    setActiveIndicies((prev) => {
      const arrIndex = findNumberInArray(prev, index);
      if (arrIndex !== undefined) {
        return prev.filter((val) => val !== index);
      }
      return [...prev, index].filter((val) => val >= 0);
    });
    setTransientIndex(undefined);
  };

  const onPieSectorTap = (index: number) => {
    setActiveIndicies((prev) => {
      const arrIndex = findNumberInArray(prev, index);
      if (arrIndex !== undefined) {
        return prev.filter((val) => val !== index);
      }
      return [...prev, index].filter((val) => val >= 0);
    });
    setTransientIndex(undefined);
  };

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

  const indexes: number[] = Array.from(
    new Set([...activeIndicies, transientIndex].filter((n) => n !== undefined))
  );

  const centerSpend = dataTableEntries.length
    ? indexes.reduce((accumulated, activeIndex) => {
        return accumulated + dataTableEntries[activeIndex].amount;
      }, 0)
    : 0;

  const centerSpendAmountFormatted =
    centerSpend &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(centerSpend);

  const timeRangeDescription = `${formatDateHuman(
    new Date(activeGraphFilters.timeRange[0])
  )} - ${formatDateHuman(new Date(activeGraphFilters.timeRange[1]))}`;

  const categoryConfigObj = buildChartConfig(categoryMap["Expense"]);

  const chartConfig: ChartConfig = categoryConfigObj;

  const innerRadius = isMobile ? 30 : 50;

  return (
    <>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            Total Spent
          </CardTitle>
          <CardDescription>{timeRangeDescription}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-full flex flex-1 p-0 px-8">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square max-w-[250px]"
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
              activeIndex={
                transientIndex !== undefined
                  ? activeIndicies.concat(transientIndex)
                  : activeIndicies
              }
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
    </>
  );
}

function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, name } = props;

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
