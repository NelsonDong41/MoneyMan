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
import ShinyText from "../ui/shinyText";
import Particles from "../ui/particles";
import { cn } from "@/lib/utils";
import { NaturalLanguageCalendar } from "../ui/naturalLanguageCalendar";
import { formatDateDash } from "@/utils/utils";

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

const convertSelectedTimeRange = (
  selectedTimeRange: string
): [string, string] => {
  const today = new Date();

  if (selectedTimeRange === "year") {
    return [
      formatDateDash(new Date(today.getFullYear(), 0, 1)),
      formatDateDash(today),
    ];
  }

  let daysToSubtract = 90;
  if (selectedTimeRange === "30d") {
    daysToSubtract = 30;
  }
  if (selectedTimeRange === "7d") {
    daysToSubtract = 7;
  }
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - daysToSubtract);
  return [formatDateDash(pastDate), formatDateDash(today)];
};

export default function ChartAreaInteractive({
  transactions,
  category,
  user,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState("year");

  const { timeRange, setTimeRange, filteredData } = useChartData(
    transactions,
    user
  );

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange(convertSelectedTimeRange("7d"));
    }
    if (!isMobile) {
      setTimeRange(convertSelectedTimeRange("year"));
    }
    setActiveIndex(null);
    setModalOpen(false);
  }, [isMobile]);

  React.useEffect(() => {
    setActiveIndex(null);
  }, [filteredData]);

  React.useEffect(() => {
    setTimeRange(convertSelectedTimeRange(selectedTimeRange));
  }, [selectedTimeRange]);

  const activeDataPoint =
    activeIndex !== null && filteredData.length
      ? filteredData[activeIndex]
      : null;

  return (
    <>
      <Card
        className={cn(
          "@container/card max-w-6xl mx-auto w-full relative bg-popover/80 backdrop-blur-3xl rounded-xl border border-white/25 shadow-lg",
          !filteredData.length &&
            "bg-transparent backdrop-blur-2xl rounded-xl border border-white/25 shadow-lg"
        )}
      >
        {!filteredData.length && (
          <div className="-z-50 pointer-events-none">
            <Particles
              particleColors={["#ffffff", "#ffffff"]}
              particleCount={2000}
              particleSpread={50}
              speed={0.05}
              particleBaseSize={150}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={false}
              className="absolute w-full h-full z-50"
            />
            <ShinyText
              className="absolute font-extrabold sm:text-2xl italic flex w-full h-full items-center justify-center "
              text={`No Data this ${timeRange}`}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Transactions over {timeRange}
            </span>
            <span className="@[540px]/card:hidden">Last {timeRange}</span>
          </CardDescription>
          <CardContent className="flex justify-between">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden bg-popover"
                aria-label="Select a value"
              >
                <SelectValue placeholder="This Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="custom" className="rounded-lg">
                  Custom
                </SelectItem>
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
            {selectedTimeRange === "custom" && (
              <div className="flex">
                <NaturalLanguageCalendar
                  value={timeRange[0]}
                  onChange={(e) =>
                    setTimeRange((prev) => [
                      formatDateDash(new Date(e)),
                      prev[1],
                    ])
                  }
                />
                <NaturalLanguageCalendar
                  value={timeRange[1]}
                  onChange={(e) =>
                    setTimeRange((prev) => [
                      prev[0],
                      formatDateDash(new Date(e)),
                    ])
                  }
                />
              </div>
            )}
          </CardContent>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredData.length && (
            <div className="aspect-auto h-[250px] w-full" />
          )}

          {!!filteredData.length && (
            <ChartContainer
              config={chartConfig}
              className={"aspect-auto h-[250px] w-full p-6"}
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
