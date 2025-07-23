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
import { formatDateHuman } from "@/utils/utils";
import {
  ChartTypeOptions,
  useTransactions,
} from "@/context/TransactionsContext";
import useInteractiveCategoryAreaChartData from "./hooks/useInteractiveCategoryAreaChartData";
import CategoryComposedChart from "./CategoryComposedChart";

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

  const { dataTableEntries } = useInteractiveCategoryAreaChartData(
    type,
    pieSelectedCategory
  );

  const activeDataPoint =
    activeIndex !== null && dataTableEntries.length
      ? dataTableEntries[activeIndex]
      : null;

  return (
    <div className="flex-1">
      <CardHeader>
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
      <CardContent className="flex-1 h-72 p-0 w-full">
        {!dataTableEntries.length && (
          <div className="h-full w-full sm:p-6 aspect-[5/2]" />
        )}

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
