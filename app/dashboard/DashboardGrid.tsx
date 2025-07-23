"use client";

import React from "react";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionArea/InteractiveTransactionAreaChart";
import TransparentCard from "@/components/ui/transparentCard";
import { SpendCard } from "@/components/charts/PieChart/SpendCard";
import { IncomeCard } from "@/components/charts/PieChart/IncomeCard";

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
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 3, md: 3, sm: 3, xs: 1, xxs: 1 };

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid() {
  const SpendPieCard = () => {
    return (
      <TransparentCard>
        <SpendCard />
      </TransparentCard>
    );
  };

  const IncomePieCard = () => {
    return (
      <TransparentCard>
        <IncomeCard />
      </TransparentCard>
    );
  };
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
          className="rounded shadow flex items-center justify-center drag-handle cursor-default sm:p2"
        >
          <SpendPieCard />
        </div>
        <div
          key="c"
          className="rounded shadow flex items-center justify-center drag-handle cursor-default sm:p2"
        >
          <IncomePieCard />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
