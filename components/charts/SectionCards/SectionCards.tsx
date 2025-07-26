import SectionCard from "@/components/ui/sectionCard";
import useAccumulatedValues from "@/hooks/useAccumulatedValues";
import {
  formatDateDash,
  getFirstDateOfMonth,
  getLastMonth,
} from "@/utils/utils";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

const layouts: Layouts = {
  lg: [
    { i: "a", x: 0, y: 0, w: 1, h: 3 },
    { i: "b", x: 1, y: 0, w: 1, h: 3 },
    { i: "c", x: 2, y: 0, w: 1, h: 3 },
    { i: "d", x: 3, y: 0, w: 1, h: 3 },
  ],
  xs: [
    { i: "a", x: 0, y: 0, w: 1, h: 4, static: true },
    { i: "b", x: 1, y: 0, w: 1, h: 4, static: true },
    { i: "c", x: 0, y: 2, w: 1, h: 4, static: true },
    { i: "d", x: 1, y: 2, w: 1, h: 4, static: true },
  ],
};
const cols = { lg: 4, md: 4, sm: 2, xs: 2, xxs: 1 };

export default function SectionCards() {
  const today = new Date();
  const todayFormatted = formatDateDash(today);
  const firstDateOfMonth = getFirstDateOfMonth(todayFormatted);
  const firstDateLastMonth = getFirstDateOfMonth(getLastMonth(todayFormatted));
  const { accumuatedIncome, accumulatedSpend } =
    useAccumulatedValues(firstDateOfMonth);
  const {
    accumuatedIncome: lastMonthIncome,
    accumulatedSpend: lastMonthSpend,
  } = useAccumulatedValues(firstDateLastMonth);

  const incomePercentDiff = !!lastMonthIncome
    ? (accumuatedIncome - lastMonthIncome) / lastMonthIncome
    : undefined;

  const spendPercentDiff = !!lastMonthSpend
    ? (accumulatedSpend - lastMonthSpend) / lastMonthSpend
    : undefined;
  return (
    <ResponsiveGridLayout
      className="layout w-full"
      layouts={layouts}
      cols={cols}
      rowHeight={50}
      draggableHandle=".drag-handle"
      isResizable={false}
    >
      <div key="a" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`$${accumuatedIncome.toFixed(2)}`}
          description="Monthly Income"
          value={incomePercentDiff}
        />
      </div>
      <div key="b" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          key="b"
          title={`$${accumulatedSpend.toFixed(2)}`}
          description="Monthly Spend"
          value={spendPercentDiff}
          isMoreBetter={false}
        />
      </div>
      <div key="c" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`$${accumuatedIncome.toFixed(2)}`}
          description="Monthly Income"
          value={incomePercentDiff}
        />
      </div>
      <div key="d" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          key="b"
          title={`$${accumulatedSpend.toFixed(2)}`}
          description="Monthly Spend"
          value={spendPercentDiff}
        />
      </div>
    </ResponsiveGridLayout>
  );
}
