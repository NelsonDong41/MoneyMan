import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
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
} from "../../../ui/chart";
import { CategoricalChartState } from "recharts/types/chart/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { stringToOklchColor } from "@/utils/utils";
import { CategoryChartDataEntry } from "./hooks/useInteractiveCategoryAreaChartData";
import { useCategorySpendLimit } from "@/context/CategorySpendLimitContext";

type CategoryComposedChartProps = {
  dataTableEntries: CategoryChartDataEntry[];
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setDataTableModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pieSelectedCategory?: string;
};

export default function CategoryComposedChart({
  dataTableEntries,
  setActiveIndex,
  setDataTableModalOpen,
  pieSelectedCategory,
}: CategoryComposedChartProps) {
  const isMobile = useIsMobile();
  const { categorySpendLimits } = useCategorySpendLimit();
  const categoryConfigObj = pieSelectedCategory
    ? buildChartConfig([pieSelectedCategory])
    : {};

  const chartConfig: ChartConfig = {
    amount: {
      label: "Amount",
      color: !pieSelectedCategory ? "var(--chart-1)" : "var(--chart-1-muted)",
    },
    ...categoryConfigObj,
  };

  const handleChartClick = (state: CategoricalChartState) => {
    if (!state || !state.activeTooltipIndex) {
      return;
    }
    const { amount } = dataTableEntries[state.activeTooltipIndex];
    if (amount) {
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
            <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-amount)"
                stopOpacity={1.0}
              />
              <stop
                offset="95%"
                stopColor="var(--color-amount)"
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
          <Area
            dataKey="amount"
            type="linear"
            fill="url(#fillAmount)"
            stroke="var(--color-amount)"
          />
          {pieSelectedCategory && (
            <Line
              dataKey={pieSelectedCategory}
              stroke={
                chartConfig[pieSelectedCategory].color ?? "var(--chart-4)"
              }
              type="linear"
              strokeWidth={2}
              dot={false}
            />
          )}

          {pieSelectedCategory && (
            <ReferenceLine
              y={categorySpendLimits.get(pieSelectedCategory)?.limit}
              stroke="red"
              strokeDasharray="3 3"
            />
          )}
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
