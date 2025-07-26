"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart, Sector } from "recharts";
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
import InteractiveCategoryAreaChart from "./InteractiveCategoryAreaChart/InteractiveCategoryAreaChart";
import TransparentCard from "@/components/ui/transparentCard";
import { GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Type } from "@/utils/supabase/supabase";

export function PieChartCard({ type }: { type: Type }) {
  const id = `${type}-pie`;
  const { transactionsInRange, activeGraphFilters } = useTransactions();
  const { categoryMap } = useCategoryMap();
  const isMobile = useIsMobile();

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>();
  const [transientIndex, setTransientIndex] = React.useState<
    number | undefined
  >();
  const { pieChartData } = usePieChartData(type);

  const onPieEnter = (_: any, index: number) => {
    setTransientIndex(index);
  };

  const onPieLeave = () => {
    setTransientIndex(undefined);
  };

  const onPieSectorTap = (index: number) => {
    setActiveIndex((prev) => (prev === index ? undefined : index));
    setTransientIndex(undefined);
  };

  const onPieClick = (_: any, index: number) => {
    onPieSectorTap(index);
  };

  const totalValue = React.useMemo(
    () =>
      transactionsInRange.reduce((prev, curr) => {
        if (curr.type !== type || curr.status === "Canceled") return prev;
        return prev + curr.amount;
      }, 0),
    [transactionsInRange]
  );

  const totalValueAmountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalValue);

  const selectedCategoryValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    activeIndex !== undefined && pieChartData[activeIndex]
      ? pieChartData[activeIndex].amount
      : 0
  );

  const centerValue =
    pieChartData.length && activeIndex !== undefined
      ? (((pieChartData[activeIndex]?.amount || 0) / totalValue) * 100).toFixed(
          3
        ) + "%"
      : totalValueAmountFormatted;

  const timeRangeDescription = `${formatDateHuman(
    new Date(activeGraphFilters.timeRange[0])
  )} - ${formatDateHuman(new Date(activeGraphFilters.timeRange[1]))}`;

  const categoryConfigObj = buildChartConfig(categoryMap[type]);

  const chartConfig: ChartConfig = categoryConfigObj;

  const innerRadius = isMobile ? 30 : 50;

  const pieSelectedCategory = pieChartData.find(
    (_data, i) => i === activeIndex
  )?.category;

  return (
    <TransparentCard className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between w-full h-full">
        <div className="flex h-full max-h-[500px] flex-col pb-6 gap-0 sm:pb-0">
          <ChartStyle id={id} config={chartConfig} />
          <CardHeader className="flex-row items-center space-y-0 py-6">
            <GripVertical className="drag-handle cursor-default mr-5" />
            <div className="grid gap-1">
              <CardTitle className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                Total {type === "Expense" ? "Spend" : "Earned"}
              </CardTitle>
              <CardDescription>{timeRangeDescription}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex h-full p-0 sm:pl-6 place-self-center place-content-center items-center aspect-square max-w-[300px] max-h-[400px]">
            {pieChartData.length ? (
              <ChartContainer
                id={id}
                config={chartConfig}
                className="aspect-square max-w-[300px] h-full w-full"
              >
                <PieChart>
                  {!isMobile && (
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                  )}

                  <defs>
                    {pieChartData.map((entry, index) => (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={categoryConfigObj[entry.category].color}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor={categoryConfigObj[entry.category].color}
                          stopOpacity={0.55}
                        />
                      </linearGradient>
                    ))}
                  </defs>

                  <Pie
                    data={pieChartData}
                    dataKey="amount"
                    nameKey="category"
                    className="transition-all z-50"
                    innerRadius={innerRadius}
                    strokeWidth={5}
                    activeIndex={[transientIndex, activeIndex].filter(
                      (v) => v !== undefined
                    )}
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
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {activeIndex !== undefined && (
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 180}
                                  className="fill-primary text-xl font-bold"
                                >
                                  {selectedCategoryValue}
                                </tspan>
                              )}
                              <tspan
                                x={viewBox.cx}
                                y={
                                  isMobile
                                    ? viewBox.cy - viewBox.outerRadius - 40
                                    : viewBox.cy
                                }
                                className="fill-foreground text-xl font-bold"
                              >
                                {centerValue || totalValueAmountFormatted}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 180}
                                className="fill-primary text-xl font-bold"
                              >
                                {totalValueAmountFormatted} Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                    {pieChartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${index})`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <Skeleton className="rounded-full max-w-[200px] w-full aspect-square" />
            )}
          </CardContent>
        </div>
        <InteractiveCategoryAreaChart
          id={id}
          type={type}
          pieSelectedCategory={pieSelectedCategory}
        />
      </div>
    </TransparentCard>
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
