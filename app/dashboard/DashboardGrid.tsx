"use client";

import React from "react";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import TransparentCard from "@/components/ui/transparentCard";
import { PieChartCard } from "@/components/charts/PieChart/PieChartCard";

const layouts: Layouts = {
  lg: [
    { i: "a", x: 0, y: 0, w: 3, h: 2, static: true },
    { i: "b", x: 0, y: 2, w: 3, h: 2 },
    { i: "c", x: 0, y: 4, w: 3, h: 2 },
    { i: "d", x: 2, y: 6, w: 1, h: 2 },
  ],
  xs: [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 0, y: 2, w: 1, h: 4, static: true },
    { i: "c", x: 0, y: 6, w: 1, h: 2, static: true },
    { i: "d", x: 0, y: 8, w: 1, h: 2, static: true },
  ],
};
const cols = { lg: 3, md: 3, sm: 3, xs: 1, xxs: 1 };

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid() {
  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout w-full"
        layouts={layouts}
        cols={cols}
        rowHeight={200}
        draggableHandle=".drag-handle"
        isResizable={false}
      >
        <div
          key="a"
          className="rounded shadow flex items-center justify-center col-span-3"
        >
          <div className="h-full w-full">
            <TransparentCard>
              <InteractiveTransactionAreaChart />
            </TransparentCard>
          </div>
        </div>
        <div
          key="b"
          className="rounded shadow flex items-center justify-center sm:p2"
        >
          <PieChartCard type={"Expense"} />
        </div>
        <div
          key="c"
          className="rounded shadow flex items-center justify-center sm:p2"
        >
          <PieChartCard type={"Income"} />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
