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
    { i: "a", x: 0, y: 0, w: 1, h: 4 },
    { i: "b", x: 1, y: 0, w: 1, h: 4 },
    { i: "c", x: 2, y: 0, w: 1, h: 4 },
    { i: "d", x: 3, y: 0, w: 1, h: 4 },
  ],
  xs: [
    { i: "a", x: 0, y: 0, w: 1, h: 4, static: true },
    { i: "b", x: 0, y: 4, w: 1, h: 4, static: true },
    { i: "c", x: 0, y: 8, w: 1, h: 4, static: true },
    { i: "d", x: 0, y: 12, w: 1, h: 4, static: true },
  ],
};
const cols = { lg: 4, md: 4, sm: 2, xs: 2, xxs: 1 };

export default function SectionCards() {
  const todayFormatted = formatDateDash();
  const firstDateOfMonth = getFirstDateOfMonth(todayFormatted);
  const firstDateLastMonth = getFirstDateOfMonth(getLastMonth(todayFormatted));
  const {
    accumuatedIncome,
    accumulatedSpend,
    totalIncomingTransactions,
    totalOutgoingTransactions,
  } = useAccumulatedValues(firstDateOfMonth);
  const {
    accumuatedIncome: lastMonthIncome,
    accumulatedSpend: lastMonthSpend,
    totalIncomingTransactions: lastMonthIncomingTransactions,
    totalOutgoingTransactions: lastMonthOutgoingTransactions,
  } = useAccumulatedValues(firstDateLastMonth);

  const incomePercentDiff = !!lastMonthIncome
    ? (accumuatedIncome - lastMonthIncome) / lastMonthIncome
    : undefined;

  const spendPercentDiff = !!lastMonthSpend
    ? (accumulatedSpend - lastMonthSpend) / lastMonthSpend
    : undefined;

  const outgoingTransactionsDiff = !!lastMonthOutgoingTransactions
    ? (totalOutgoingTransactions - lastMonthOutgoingTransactions) /
      lastMonthOutgoingTransactions
    : undefined;

  const incomingTransactionsDiff = !!lastMonthIncomingTransactions
    ? (totalIncomingTransactions - lastMonthIncomingTransactions) /
      lastMonthIncomingTransactions
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
          title={`$${accumulatedSpend.toFixed(2)}`}
          description="Monthly Spend"
          value={spendPercentDiff}
          isMoreBetter={false}
        />
      </div>
      <div key="c" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`${totalIncomingTransactions}`}
          description="Monthly Incoming transactions"
          value={incomingTransactionsDiff}
        />
      </div>
      <div key="d" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`${totalOutgoingTransactions}`}
          description="Monthly Outgoing transactions"
          value={outgoingTransactionsDiff}
          isMoreBetter={false}
        />
      </div>
    </ResponsiveGridLayout>
  );
}
