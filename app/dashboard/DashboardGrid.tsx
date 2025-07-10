"use client";

import React from "react";
import GridLayout, {
  Layouts,
  Responsive,
  WidthProvider,
} from "react-grid-layout";
import InteractiveTransactionAreaChart from "@/components/charts/InteractiveTransactionAreaChart";
import { CategoryRadialChart } from "@/components/charts/CategoryRadialChart";

const layouts: Layouts = {
  lg: [
    { i: "a", x: 0, y: 0, w: 3, h: 6, static: true },
    { i: "b", x: 0, y: 1, w: 1, h: 4 },
    { i: "c", x: 1, y: 1, w: 1, h: 1 },
    { i: "d", x: 2, y: 1, w: 1, h: 1 },
  ],
  xs: [
    { i: "a", x: 0, y: 0, w: 1, h: 1, static: true },
    { i: "b", x: 0, y: 1, w: 1, h: 1 },
    { i: "c", x: 0, y: 2, w: 1, h: 1 },
    { i: "d", x: 0, y: 3, w: 1, h: 1 },
  ],
};
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 3, md: 3, sm: 3, xs: 1, xxs: 1 };

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid() {
  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout w-full"
        layouts={layouts}
        cols={cols}
        rowHeight={100}
        draggableHandle=".drag-handle"
        isResizable={false}
      >
        <div
          key="a"
          className="rounded shadow flex items-center justify-center drag-handle cursor-default col-span-3"
        >
          <InteractiveTransactionAreaChart />
        </div>
        <div
          key="b"
          className="rounded shadow flex items-center justify-center drag-handle cursor-default "
        >
          <CategoryRadialChart />
        </div>
        <div
          key="c"
          className="bg-purple-500 rounded shadow flex items-center justify-center drag-handle cursor-default "
        >
          <span className="drag-handle cursor-move pr-2">⠿</span>C
        </div>
        <div
          key="d"
          className="bg-yellow-500 rounded shadow flex items-center justify-center drag-handle cursor-default "
        >
          <span className="drag-handle cursor-move pr-2">⠿</span>D
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
