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
import { TransactionWithCategory, Type } from "@/utils/supabase/supabase";
import useChartData from "@/hooks/useChartData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { DataTable } from "@/components/dataTable/data-table";
import { columns } from "@/components/dataTable/columns";
import ShinyText from "../ui/shinyText";
import Particles from "../ui/particles";
import { NaturalLanguageCalendar } from "../ui/naturalLanguageCalendar";
import { formatDateDash, formatDateHuman } from "@/utils/utils";
import { Label } from "../ui/label";
import { ArrowRight } from "lucide-react";
import { useTransactions } from "@/context/TransactionsContext";
import { type CategoryMap, useCategoryMap } from "@/context/CategoryMapContext";

const chartConfig = {
  expense: {
    label: "Expense",
    color: "var(--chart-1)",
  },
  balance: {
    label: "Balance",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig satisfies ChartConfig;

export type ChartAreaInteractiveProps = {
  transactions: TransactionWithCategory[];
  categoryMap: CategoryMap;
};

export type ChartOptions = "Balance" | "Expense" | "Both";
export type InteractiveChartTimeRanges =
  | "all"
  | "custom"
  | "year"
  | "3m"
  | "1m"
  | "7d";

const convertSelectedTimeRange = (
  selectedTimeRange: Exclude<InteractiveChartTimeRanges, "all" | "custom">
): [string, string] => {
  const today = new Date();

  switch (selectedTimeRange) {
    case "year":
      return [
        formatDateDash(new Date(today.getFullYear(), 0, 1)),
        formatDateDash(today),
      ];
    case "3m": {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "1m": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "7d": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      const end = today;
      return [formatDateDash(start), formatDateDash(end)];
    }
    default:
      throw new Error("Converting Invalid time range", selectedTimeRange);
  }
};

export default function InteractiveTransactionAreaChart() {
  const { transactions } = useTransactions();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] =
    React.useState<InteractiveChartTimeRanges>("year");
  const [activeGraph, setActiveGraph] = React.useState<ChartOptions>("Expense");
  const firstDate = transactions.length ? transactions[0] : null;
  const { timeRange, setTimeRange, dataTableEntries } =
    useChartData(transactions);

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

  const activeDataPoint = React.useMemo(() => {
    return activeIndex !== null && dataTableEntries.length
      ? dataTableEntries[activeIndex]
      : null;
  }, [activeIndex, dataTableEntries]);

  React.useEffect(() => {
    if (!activeDataPoint) {
      setActiveIndex(null);
    }
  }, [dataTableEntries, activeDataPoint]);

  React.useEffect(() => {
    if (selectedTimeRange === "all" && firstDate) {
      setTimeRange([firstDate.date, formatDateDash(new Date())]);
      return;
    }
    setTimeRange(
      convertSelectedTimeRange(
        selectedTimeRange as Exclude<
          InteractiveChartTimeRanges,
          "all" | "custom"
        >
      )
    );
  }, [selectedTimeRange]);

  return (
    <>
      <Card className="@container/card mx-auto w-full relative bg-popover/80 backdrop-blur-3xl rounded-xl border border-white/25 shadow-lg p-1">
        {!dataTableEntries.length && (
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
          <CardTitle className="flex justify-between items-center">
            Transactions{" "}
            <Select
              value={activeGraph}
              onValueChange={(e) => setActiveGraph(e as ChartOptions)}
            >
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden bg-popover"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Both" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Both" className="rounded-lg">
                  Both
                </SelectItem>
                <SelectItem value="Balance" className="rounded-lg">
                  Balance
                </SelectItem>
                <SelectItem value="Expense" className="rounded-lg">
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
          <CardDescription className="grid">
            <span className="hidden @[540px]/card:block">
              From {timeRange[0]} - {timeRange[1]}
            </span>
            <span className="@[540px]/card:hidden">
              From {formatDateHuman(new Date(timeRange[0]))} -{" "}
              {formatDateHuman(new Date(timeRange[1]))}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!dataTableEntries.length && (
            <div className="aspect-auto h-[400px] w-full" />
          )}

          {!!dataTableEntries.length && (
            <ChartContainer
              config={chartConfig}
              className={"aspect-auto h-[400px] w-full p-6"}
            >
              <AreaChart
                data={dataTableEntries}
                onClick={(state) => {
                  if (!state || !state.activeTooltipIndex) {
                    return;
                  }
                  const { expense, balance } =
                    dataTableEntries[state.activeTooltipIndex];
                  const hasData = expense || balance;
                  if (hasData) {
                    setActiveIndex(state.activeTooltipIndex);
                    setModalOpen(true);
                  }
                }}
                syncId="chart"
              >
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-balance)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-balance)"
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
                          year: "numeric",
                          timeZone: "UTC",
                        });
                      }}
                      indicator="line"
                    />
                  }
                />
                {(activeGraph === "Both" || activeGraph === "Balance") && (
                  <Area
                    dataKey="balance"
                    type="linear"
                    fill="url(#fillBalance)"
                    stroke="var(--color-balance)"
                  />
                )}
                {(activeGraph === "Both" || activeGraph === "Expense") && (
                  <Area
                    dataKey="expense"
                    type="linear"
                    fill="url(#fillExpense)"
                    stroke="var(--color-expense)"
                  />
                )}
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardContent className="flex justify-between items-end">
          <Select
            value={selectedTimeRange}
            onValueChange={(e) =>
              setSelectedTimeRange(e as InteractiveChartTimeRanges)
            }
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden bg-popover"
              aria-label="Select a value"
            >
              <SelectValue placeholder="This Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All time
              </SelectItem>
              <SelectItem value="custom" className="rounded-lg">
                Custom
              </SelectItem>
              <SelectItem value="year" className="rounded-lg">
                This Year
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="1m" className="rounded-lg">
                This Month
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          {selectedTimeRange === "custom" && (
            <div className="flex gap-5 items-center">
              <div className="flex flex-col gap-1">
                <Label className="pl-2">Start Date</Label>
                <NaturalLanguageCalendar
                  value={timeRange[0]}
                  onChange={(e) =>
                    setTimeRange((prev) => [
                      formatDateDash(new Date(e)),
                      prev[1],
                    ])
                  }
                />
              </div>
              <ArrowRight />
              <div className="flex flex-col gap-1">
                <Label className="pl-2">End Date</Label>
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
            </div>
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
            <DialogTitle>
              Transactions for{" "}
              {formatDateHuman(new Date(activeDataPoint?.date || ""))}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="max-w-full w-full">
            {activeDataPoint && (
              <DataTable
                columns={columns}
                transactionFilters={{
                  date: activeDataPoint.date,
                  type: chartOptionToType(activeGraph),
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function chartOptionToType(chartOption: ChartOptions) {
  let type: Type | undefined;

  switch (chartOption) {
    case "Balance":
      type = "Income";
      break;
    case "Expense":
      type = "Expense";
      break;
    default:
      type = undefined;
  }
  return type;
}
