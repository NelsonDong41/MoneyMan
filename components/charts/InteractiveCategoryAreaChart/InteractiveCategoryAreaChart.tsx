"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { DataTable } from "@/components/dataTable/data-table";
import { columns } from "@/components/dataTable/columns";
import ShinyText from "@/components/ui/shinyText";
import Particles from "@/components/ui/particles";
import { NaturalLanguageCalendar } from "@/components/ui/naturalLanguageCalendar";
import {
  convertSelectedTimeRange,
  formatDateDash,
  formatDateHuman,
} from "@/utils/utils";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import {
  ChartTypeOptions,
  InteractiveChartTimeRanges,
  useTransactions,
} from "@/context/TransactionsContext";
import useInteractiveCategoryAreaChartData from "./hooks/useInteractiveCategoryAreaChartData";

export default function InteractiveCategoryAreaChart(type: Type) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [dataTableModalOpen, setDataTableModalOpen] = React.useState(false);
  const { activeGraphFilters, setActiveGraphFilterTimeRange } =
    useTransactions();

  const { dataTableEntries } = useInteractiveCategoryAreaChartData(type);

  console.log(dataTableEntries);

  const activeDataPoint =
    activeIndex !== null && dataTableEntries.length
      ? dataTableEntries[activeIndex]
      : null;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          Spending Categories
        </CardTitle>
        <CardDescription className="grid">
          <span className="hidden @[540px]/card:block">
            From {activeGraphFilters.timeRange[0]} -{" "}
            {activeGraphFilters.timeRange[1]}
          </span>
          <span className="@[540px]/card:hidden">
            From {formatDateHuman(new Date(activeGraphFilters.timeRange[0]))} -{" "}
            {formatDateHuman(new Date(activeGraphFilters.timeRange[1]))}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 w-full">
        {!dataTableEntries.length && (
          <div className="h-full w-full sm:p-6 aspect-[5/2]" />
        )}

        {!!dataTableEntries.length && (
          <TransactionComposedChart
            dataTableEntries={dataTableEntries}
            setActiveIndex={setActiveIndex}
            setDataTableModalOpen={setDataTableModalOpen}
          />
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
                value={activeGraphFilters.timeRange[0]}
                onChange={(e) => {
                  const prev = activeGraphFilters.timeRange;
                  const newTimeRange: [string, string] = [
                    formatDateDash(new Date(e)),
                    prev[1],
                  ];
                  setActiveGraphFilterTimeRange(newTimeRange);
                }}
              />
            </div>
            <ArrowRight />
            <div className="flex flex-col gap-1">
              <Label className="pl-2">End Date</Label>
              <NaturalLanguageCalendar
                value={activeGraphFilters.timeRange[1]}
                onChange={(e) => {
                  const prev = activeGraphFilters.timeRange;
                  const newTimeRange: [string, string] = [
                    prev[0],
                    formatDateDash(new Date(e)),
                  ];
                  setActiveGraphFilterTimeRange(newTimeRange);
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <Dialog
        open={dataTableModalOpen}
        onOpenChange={(open) => {
          setActiveIndex(null);
          setDataTableModalOpen(open);
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
                  type: chartOptionToType(activeGraphFilters.type),
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function chartOptionToType(chartOption: ChartTypeOptions) {
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
