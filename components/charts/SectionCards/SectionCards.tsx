import SectionCard from "@/components/ui/sectionCard";
import useAccumulatedValues from "@/hooks/useAccumulatedValues";
import {
  formatDateDash,
  getFirstDateOfMonth,
  getLastDateOfMonth,
  getLastMonth,
} from "@/utils/utils";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";
import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";

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
    accumulatedIncome,
    accumulatedSpend,
    totalIncomingTransactions,
    totalOutgoingTransactions,
  } = useAccumulatedValues({
    startDate: firstDateOfMonth,
    endDate: getLastDateOfMonth(todayFormatted),
  });
  const {
    accumulatedIncome: lastMonthIncome,
    accumulatedSpend: lastMonthSpend,
    totalIncomingTransactions: lastMonthIncomingTransactions,
    totalOutgoingTransactions: lastMonthOutgoingTransactions,
  } = useAccumulatedValues({
    startDate: firstDateLastMonth,
    endDate: getLastDateOfMonth(getLastMonth(todayFormatted)),
  });

  const incomeDiff = accumulatedIncome - lastMonthIncome;
  const incomePercentDiff = !!lastMonthIncome
    ? incomeDiff / lastMonthIncome
    : undefined;

  const spendDiff = accumulatedSpend - lastMonthSpend;
  const spendPercentDiff = !!lastMonthSpend
    ? spendDiff / lastMonthSpend
    : undefined;

  const incomingTransactionsCountDiff =
    totalIncomingTransactions - lastMonthIncomingTransactions;
  const incomingTransactionsPercentDiff = !!lastMonthIncomingTransactions
    ? incomingTransactionsCountDiff / lastMonthIncomingTransactions
    : undefined;

  const outgoingTransactionsCountDiff =
    totalOutgoingTransactions - lastMonthOutgoingTransactions;
  const outgoingTransactionsPercentDiff = !!lastMonthOutgoingTransactions
    ? outgoingTransactionsCountDiff / lastMonthOutgoingTransactions
    : undefined;

  let incomeValueFooter: React.ReactNode = (
    <>
      No Money Earned Last Month, up $${accumulatedIncome.toFixed(2)}
      <div className={`text-green-500`}>
        <TrendingUp />
      </div>
    </>
  );
  let incomeValueColor = "white";

  if (incomeDiff) {
    incomeValueColor = incomeDiff >= 0 ? "green" : "red";
    incomeValueFooter = (
      <>
        Income {incomeDiff >= 0 ? "Up" : "Down"} by $
        {Math.abs(incomeDiff).toFixed(2)} since last month
        <div className={`text-${incomeValueColor}-500`}>
          {incomeDiff >= 0 ? <TrendingUp /> : <TrendingDown />}
        </div>
      </>
    );
  }

  let spendValueFooter: React.ReactNode = (
    <>
      No Money Spent Last Month, up ${accumulatedIncome.toFixed(2)}
      <div className={`text-red-500`}>
        <TrendingUp />
      </div>
    </>
  );
  let spendValueColor = "white";
  if (spendDiff) {
    spendValueColor = spendDiff >= 0 ? "red" : "green";
    spendValueFooter = (
      <>
        Spend {spendDiff >= 0 ? "Up" : "Down"} by $
        {Math.abs(spendDiff).toFixed(2)} since last month
        <div className={`text-${spendValueColor}-500`}>
          {spendDiff >= 0 ? <TrendingUp /> : <TrendingDown />}
        </div>
      </>
    );
  }

  const incomingTransactionsColor =
    incomingTransactionsCountDiff >= 0 ? "green" : "red";

  let incomingTransactionsFooter: React.ReactNode = (
    <>
      {incomingTransactionsCountDiff >= 0 ? "Up" : "Down"} by{" "}
      {incomingTransactionsCountDiff} from last month's{" "}
      <strong>{lastMonthIncomingTransactions}</strong> transactions
      <div className={`text-${incomingTransactionsColor}-500`}>
        <TrendingUp />
      </div>
    </>
  );

  const outgoingTransactionsColor =
    outgoingTransactionsCountDiff >= 0 ? "red" : "green";

  let outgoingTransactionsFooter: React.ReactNode = (
    <>
      {outgoingTransactionsCountDiff >= 0 ? "Up" : "Down"} by{" "}
      {outgoingTransactionsCountDiff} from last month's{" "}
      <strong>{lastMonthOutgoingTransactions}</strong> transactions
      <div className={`text-${outgoingTransactionsColor}-500`}>
        <TrendingUp />
      </div>
    </>
  );

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
          title={`$${accumulatedIncome.toFixed(2)}`}
          description="Monthly Income"
          badgeValue={incomePercentDiff}
          footer={incomeValueFooter}
          color={incomeValueColor}
        />
      </div>
      <div key="b" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`$${accumulatedSpend.toFixed(2)}`}
          description="Monthly Spend"
          badgeValue={spendPercentDiff}
          footer={spendValueFooter}
          color={spendValueColor}
        />
      </div>
      <div key="c" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`${totalIncomingTransactions}`}
          description="Monthly Incoming transactions"
          badgeValue={incomingTransactionsPercentDiff}
          footer={incomingTransactionsFooter}
          color={incomingTransactionsColor}
        />
      </div>
      <div key="d" className="rounded shadow sm:p2 drag-handle">
        <SectionCard
          title={`${totalOutgoingTransactions}`}
          description="Monthly Outgoing transactions"
          badgeValue={outgoingTransactionsPercentDiff}
          footer={outgoingTransactionsFooter}
          color={outgoingTransactionsColor}
        />
      </div>
    </ResponsiveGridLayout>
  );
}
