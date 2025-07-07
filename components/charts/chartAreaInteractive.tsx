"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/useIsMobile";
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
  ChartLegend,
  ChartLegendContent,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import useChartData, { ChartAreaDataEntry } from "@/hooks/useChartData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Tables } from "@/utils/supabase/types";
import { User } from "@supabase/supabase-js";
import { DataTable } from "@/app/transactions/data-table";
import { columns } from "@/app/transactions/columns";

export const description = "An interactive area chart";

const chartConfig = {
  expense: {
    label: "Expense",
    color: "var(--chart-1)",
  },
  income: {
    label: "Income",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig satisfies ChartConfig;

export type ChartAreaInteractiveProps = {
  transactions: TransactionWithCategory[];
  category: Tables<"Category">[];
  user: User;
};

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getAllDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let startDate = new Date(start);
  const endDate = new Date(end);
  while (startDate <= endDate) {
    dates.push(formatDate(startDate));
    startDate = new Date(startDate.getTime() + 86400000);
  }
  dates.push(formatDate(startDate));

  return dates;
}

export default function ChartAreaInteractive({
  transactions,
  category,
  user,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("year");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const [dataByType] = useChartData(transactions);

  const now = new Date();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
    if (!isMobile) {
      setTimeRange("year");
    }
    setActiveIndex(null);
    setModalOpen(false);
  }, [isMobile]);

  React.useEffect(() => {
    setActiveIndex(null);
  }, [dataByType]);

  let filteredData: ChartAreaDataEntry[] = [];

  if (timeRange === "year") {
    const yearFiltered = Array.from(dataByType.values()).filter((item) => {
      return item.date.split("-")[0] === now.getFullYear().toString();
    });

    const yearFilteredLength = yearFiltered.length;
    if (yearFilteredLength !== 0) {
      const datesInYear = getAllDatesInRange(
        yearFiltered[0].date,
        yearFiltered[yearFilteredLength - 1].date
      );

      filteredData = datesInYear.map((dateStr) => {
        return (
          dataByType.get(dateStr) || {
            date: dateStr,
          }
        );
      });
    }
  } else {
    filteredData = Array.from(dataByType.values()).filter((item) => {
      const date = new Date(item.date);
      const referenceDate = new Date();
      let daysToSubtract = 90;
      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });
  }

  const activeDataPoint =
    activeIndex !== null && filteredData.length
      ? filteredData[activeIndex]
      : null;

  return (
    <>
      <Card className="@container/card max-w-6xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Transactions over {timeRange}
            </span>
            <span className="@[540px]/card:hidden">Last {timeRange}</span>
          </CardDescription>
          <CardContent>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                aria-label="Select a value"
              >
                <SelectValue placeholder="This Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="year" className="rounded-lg">
                  This Year
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {!filteredData.length && (
            <div className="flex aspect-auto h-[250px] w-full text-center text-muted justify-center items-center border border-border rounded-xl">
              No Data this year
            </div>
          )}

          {!!filteredData.length && (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart
                data={filteredData}
                onClick={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setActiveIndex(state.activeTooltipIndex);
                    setModalOpen(true);
                  }
                }}
              >
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-income)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-income)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-expense)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-expense)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickCount={3}
                />
                <ChartTooltip
                  cursor={true}
                  defaultIndex={isMobile ? -1 : 10}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        });
                      }}
                      indicator="line"
                    />
                  }
                />
                <Area
                  dataKey="income"
                  type="linear"
                  fill="url(#fillIncome)"
                  stroke="var(--color-income)"
                />
                <Area
                  dataKey="expense"
                  type="linear"
                  fill="url(#fillExpense)"
                  stroke="var(--color-expense)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setActiveIndex(null);
          setModalOpen(open);
        }}
      >
        <DialogContent
          className={
            isMobile
              ? "max-w-full h-full w-full flex flex-col items-center overflow-y-auto"
              : "max-w-2xl w-full flex flex-col overflow-y-auto"
          }
        >
          <DialogHeader>
            <DialogTitle>Transactions for {activeDataPoint?.date}</DialogTitle>
            <DialogDescription>what</DialogDescription>
          </DialogHeader>
          <div className="max-w-full w-full">
            {activeDataPoint && (
              <DataTable
                columns={columns}
                transactions={transactions.filter(
                  (t) => t.date === activeDataPoint.date
                )}
                category={category}
                user={user}
                date={activeDataPoint.date}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
