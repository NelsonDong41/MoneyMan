"use client";

import React from "react";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";
import TransparentCard from "@/components/ui/transparentCard";
import { PieChartCard } from "@/components/charts/PieChart/PieChartCard";
import SectionCards from "@/components/charts/SectionCards/SectionCards";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";

const layouts: Layouts = {
  lg: [
    { i: "a", x: 0, y: 0, w: 4, h: 9, static: true },
    { i: "b", x: 0, y: 9, w: 4, h: 9 },
    { i: "c", x: 0, y: 18, w: 4, h: 9 },
    { i: "d", x: 0, y: 27, w: 1, h: 4 },
  ],
  xs: [
    { i: "a", x: 0, y: 0, w: 1, h: 9, static: true },
    { i: "b", x: 0, y: 9, w: 1, h: 17, static: true },
    { i: "c", x: 0, y: 26, w: 1, h: 17, static: true },
    { i: "d", x: 0, y: 43, w: 1, h: 17, static: true },
  ],
};
const cols = { lg: 4, md: 3, sm: 3, xs: 1, xxs: 1 };

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid() {
  return (
    <>
      <div>
        <SectionCards />
        <ResponsiveGridLayout
          className="layout w-full"
          layouts={layouts}
          cols={cols}
          rowHeight={50}
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
    </>
  );
}
