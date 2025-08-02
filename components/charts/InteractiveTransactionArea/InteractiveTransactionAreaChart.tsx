"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from "@/utils/supabase/supabase";
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
import useInteractiveTransactionAreaChartData from "./hooks/useInteractiveTransactionAreaChartData";
import { CategoryDropdown } from "./CategoryDropdown";
import TransactionComposedChart from "./TransactionComposedChart";
import { addMonths, addWeeks } from "date-fns";

const CHART_TYPE_OPTIONS: ChartTypeOptions[] = [
  "Both",
  "Balance",
  "Expense",
] as const;

export default function InteractiveTransactionAreaChart() {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [dataTableModalOpen, setDataTableModalOpen] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] =
    React.useState<InteractiveChartTimeRanges>("1m");
  const {
    activeGraphFilters,
    setActiveGraphFilterTimeRange,
    setActiveGraphFilterType,
  } = useTransactions();

  const { dataTableEntries, periodType } =
    useInteractiveTransactionAreaChartData();

  React.useEffect(() => {
    setActiveGraphFilterTimeRange(convertSelectedTimeRange(selectedTimeRange));
  }, [selectedTimeRange]);

  let activeDataRange: { start: string; end: string } | null;
  if (activeIndex === null || !dataTableEntries.length) {
    activeDataRange = null;
  } else {
    switch (periodType) {
      case "day":
        activeDataRange = {
          start: dataTableEntries[activeIndex].date,
          end: dataTableEntries[activeIndex].date,
        };
        break;

      case "week":
        activeDataRange = {
          start: dataTableEntries[activeIndex].date,
          end: formatDateDash(addWeeks(dataTableEntries[activeIndex].date, 1)),
        };
        break;
      case "month":
        activeDataRange = {
          start: dataTableEntries[activeIndex].date,
          end: formatDateDash(addMonths(dataTableEntries[activeIndex].date, 1)),
        };
        break;
    }
  }

  return (
    <>
      {!dataTableEntries.some((entry) => entry.balance || entry.expense) && (
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
          <ShinyText className="absolute font-extrabold sm:text-2xl italic flex w-full h-full items-center justify-center ">
            No Data from {activeGraphFilters.timeRange.join(" - ")}
          </ShinyText>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          Transactions{" "}
          <div className="flex items-center gap-4 justify-between">
            <Select
              value={activeGraphFilters.type}
              onValueChange={(e) =>
                setActiveGraphFilterType(e as ChartTypeOptions)
              }
            >
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden bg-popover"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Both" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CHART_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option + "-select"}
                    value={option}
                    className="rounded-lg"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CategoryDropdown />
          </div>
        </CardTitle>
        <CardDescription className="grid">
          <span className="hidden @[540px]/card:block">
            From {activeGraphFilters.timeRange[0]} -{" "}
            {activeGraphFilters.timeRange[1]}
          </span>
          <span className="@[540px]/card:hidden">
            From {formatDateHuman(activeGraphFilters.timeRange[0])} -{" "}
            {formatDateHuman(activeGraphFilters.timeRange[1])}
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
                    formatDateDash(e),
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
                    formatDateDash(e),
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
              {activeDataRange &&
                `${formatDateHuman(activeDataRange.start)} - ${formatDateHuman(activeDataRange.end)} `}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="max-w-full w-full">
            {activeDataRange && (
              <DataTable
                columns={columns}
                transactionFilters={{
                  dateRange: activeDataRange,
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
