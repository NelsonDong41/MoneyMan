import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { InteractiveChartDataEntry } from "./hooks/useInteractiveTransactionAreaChartData";
import { CategoricalChartState } from "recharts/types/chart/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { stringToOklchColor } from "@/utils/utils";
import { useTransactions } from "@/context/TransactionsContext";

type TransactionComposedChartProps = {
  dataTableEntries: InteractiveChartDataEntry[];
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setDataTableModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TransactionComposedChart({
  dataTableEntries,
  setActiveIndex,
  setDataTableModalOpen,
}: TransactionComposedChartProps) {
  const isMobile = useIsMobile();
  const { activeGraphFilters } = useTransactions();
  const categoryConfigObj = buildChartConfig(activeGraphFilters.categories);

  const chartConfig: ChartConfig = {
    expense: {
      label: "Expense",
      color: "var(--chart-1)",
    },
    balance: {
      label: "Balance",
      color: "var(--chart-2)",
    },
    ...categoryConfigObj,
  };

  const handleChartClick = (state: CategoricalChartState) => {
    if (!state || !state.activeTooltipIndex) {
      return;
    }
    const { expense, balance } = dataTableEntries[state.activeTooltipIndex];
    const hasData = expense || balance;
    if (hasData) {
      setActiveIndex(state.activeTooltipIndex);
      setDataTableModalOpen(true);
    }
  };

  const labelFormatter = (value: string, isShort?: boolean) => {
    const year = !!isShort ? undefined : "numeric";
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year,
      timeZone: "UTC",
    });
  };

  return (
    <ResponsiveContainer className="h-full w-full pr-6">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ComposedChart
          className="h-full w-full"
          data={dataTableEntries}
          onClick={handleChartClick}
          syncId="chart"
        >
          <defs>
            <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-balance)"
                stopOpacity={1.0}
              />
              <stop
                offset="95%"
                stopColor="var(--color-balance)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-expense)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-expense)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(e) => labelFormatter(e, true)}
          />
          <YAxis
            tickFormatter={(value) => {
              if (value >= 1000) return `${value / 1000}k`;
              return value;
            }}
            width={isMobile ? 10 : 40}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={3}
          />
          <ChartTooltip
            cursor={true}
            content={
              <ChartTooltipContent
                labelFormatter={(e) => labelFormatter(e)}
                indicator="line"
              />
            }
          />
          {(activeGraphFilters.type === "Both" ||
            activeGraphFilters.type === "Balance") && (
            <Area
              dataKey="balance"
              type="linear"
              fill="url(#fillBalance)"
              stroke="var(--color-balance)"
            />
          )}
          {(activeGraphFilters.type === "Both" ||
            activeGraphFilters.type === "Expense") && (
            <Area
              dataKey="expense"
              type="linear"
              fill="url(#fillExpense)"
              stroke="var(--color-expense)"
            />
          )}
          {activeGraphFilters.categories.map((cat) => {
            return (
              <Line
                dataKey={cat}
                stroke={chartConfig[cat].color ?? "var(--chart-4)"}
                type="linear"
                strokeWidth={2}
                dot={false}
              />
            );
          })}
          {!isMobile && <ChartLegend content={<ChartLegendContent />} />}
        </ComposedChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}

export function buildChartConfig(
  categories: string[]
): Record<string, { label: string; color: string }> {
  return categories.reduce(
    (acc, c) => {
      acc[c] = { label: c, color: stringToOklchColor(c) };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );
}
