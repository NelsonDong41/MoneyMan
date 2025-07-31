"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatDateDash, formatDateHuman } from "@/utils/utils";
import {
  ChartTypeOptions,
  useTransactions,
} from "@/context/TransactionsContext";
import useInteractiveCategoryAreaChartData from "./hooks/useInteractiveCategoryAreaChartData";
import CategoryComposedChart from "./CategoryComposedChart";
import CategorySpendLimitSlider from "../CategorySpendLimitSlider/CategorySpendLimitSlider";
import { data } from "autoprefixer";
import { addDays, addMonths, addWeeks } from "date-fns";

export default function InteractiveCategoryAreaChart({
  id,
  type,
  pieSelectedCategory,
}: {
  id: string;
  type: Type;
  pieSelectedCategory?: string;
}) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [dataTableModalOpen, setDataTableModalOpen] = React.useState(false);
  const { activeGraphFilters } = useTransactions();

  const { dataTableEntries, periodType } = useInteractiveCategoryAreaChartData(
    type,
    pieSelectedCategory
  );

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

      case "week":
        activeDataRange = {
          start: dataTableEntries[activeIndex].date,
          end: formatDateDash(addWeeks(dataTableEntries[activeIndex].date, 1)),
        };

      case "month":
        activeDataRange = {
          start: dataTableEntries[activeIndex].date,
          end: formatDateDash(addMonths(dataTableEntries[activeIndex].date, 1)),
        };
    }
  }

  return (
    <div className="flex-1 flex-col h-full w-full">
      <CardHeader className=" py-0 sm:py-6">
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {type} Categories
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
      <CardContent className="flex-1 p-0 w-full max-h-[300px] h-full">
        {!dataTableEntries.length && <div className="h-full w-full sm:p-6" />}

        {!!dataTableEntries.length && (
          <CategoryComposedChart
            id={id}
            pieSelectedCategory={pieSelectedCategory}
            dataTableEntries={dataTableEntries}
            setActiveIndex={setActiveIndex}
            setDataTableModalOpen={setDataTableModalOpen}
          />
        )}
      </CardContent>
      <CardContent className="flex-1 p-0 w-full">
        {pieSelectedCategory && type === "Expense" && (
          <CategorySpendLimitSlider category={pieSelectedCategory} />
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
                  type,
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
