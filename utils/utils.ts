import { redirect } from "next/navigation";
import { InteractiveChartTimeRanges } from "@/context/TransactionsContext";
import { TimeFrame } from "./schemas/categorySpendLimitFormSchema";
import {
  differenceInDays,
  differenceInMonths,
  addDays,
  addWeeks,
  addMonths,
  format,
  startOfWeek,
  startOfMonth,
  parseISO,
  startOfYear,
  lastDayOfYear,
  lastDayOfMonth,
  lastDayOfWeek,
  subMonths,
  endOfMonth,
  subDays,
  subWeeks,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { AggregationPeriod } from "@/components/charts/InteractiveTransactionArea/hooks/useInteractiveTransactionAreaChartData";
import { formatInTimeZone } from "date-fns-tz";
import { User } from "@supabase/supabase-js";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function copyObjectToClipboard(obj: any) {
  const formatted = JSON.stringify(obj, null, 2);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(formatted);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = formatted;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

export function formatDateHuman(date: string | Date) {
  return formatInTimeZone(date, "UTC", "PPP");
}

export function formatDateDash(date?: string | Date): string {
  let dt;
  if (date === undefined) {
    dt = new Date();
  } else {
    dt = typeof date === "string" ? new Date(date) : date;
  }
  return formatInTimeZone(dt, "UTC", "yyyy-MM-dd");
}
export function getRandomDate(startDate: Date, endDate: Date) {
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();
  const randomMillis = startMillis + Math.random() * (endMillis - startMillis);
  return new Date(randomMillis);
}

// assume date is of type yyyy-mm-dd
export const getFirstDateOfYear = (dateStr: string): string => {
  return formatDateDash(startOfYear(dateStr));
};

export const getFirstDateOfMonth = (dateStr: string): string => {
  return formatDateDash(startOfMonth(dateStr));
};

export const getFirstDayOfWeek = (dateStr: string): string => {
  return formatDateDash(startOfWeek(dateStr, { weekStartsOn: 1 }));
};

export const getFirstDayWithTimeFrame = (
  timeFrame: TimeFrame,
  start: string
) => {
  let firstDay: string;

  switch (timeFrame) {
    case "Yearly":
      firstDay = getFirstDateOfYear(start);
      break;
    case "Monthly":
      firstDay = getFirstDateOfMonth(start);
      break;
    case "Weekly":
      firstDay = getFirstDayOfWeek(start);
      break;
    case "Daily":
      firstDay = start;
      break;
  }

  return firstDay;
};

// assume date is of type yyyy-mm-dd
export const getLastDateOfYear = (dateStr: string): string => {
  return formatDateDash(lastDayOfYear(dateStr));
};

// assume date is of type yyyy-mm-dd
export const getLastDateOfMonth = (dateStr: string): string => {
  return formatDateDash(lastDayOfMonth(dateStr));
};

// assume date is of type yyyy-mm-dd
export const getLastDayOfWeek = (dateStr: string): string => {
  return formatDateDash(lastDayOfWeek(dateStr, { weekStartsOn: 1 }));
};

export const getLastDayWithTimeFrame = (
  timeFrame: TimeFrame,
  start: string
) => {
  let lastDay: string;

  switch (timeFrame) {
    case "Yearly":
      lastDay = getLastDateOfYear(start);
      break;
    case "Monthly":
      lastDay = getLastDateOfMonth(start);
      break;
    case "Weekly":
      lastDay = getLastDayOfWeek(start);
      break;
    case "Daily":
      lastDay = start;
      break;
  }

  return lastDay;
};

export const getNextDay = (date: string): string => {
  return formatDateDash(addDays(date, 1));
};

export const getLastMonth = (date: string): string => {
  return formatDateDash(subMonths(date, 1));
};

export function getRandomFloatTwoDecimalPlaces(min: number, max: number) {
  const randomNumberScaled =
    Math.random() * (max * 100 - min * 100) + min * 100;

  const roundedNumber = Math.round(randomNumberScaled);

  const finalNumber = roundedNumber / 100;

  return finalNumber;
}

export function getAggregatedPeriodsInRange(
  timeRange: [string, string],
  firstDate: string
): { periods: string[]; periodType: AggregationPeriod } {
  let [start, end] = timeRange;
  if (!start && !end) {
    start = firstDate;
    end = formatDateDash();
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (start === end) return { periods: [start], periodType: "day" };

  const dayDiff = differenceInDays(endDate, startDate);
  const monthDiff = differenceInMonths(endDate, startDate);

  let periods: string[] = [];
  let periodType: AggregationPeriod;

  if (dayDiff <= 31) {
    periodType = "day";
    for (let dt = startDate; dt < endDate; dt = addDays(dt, 1)) {
      periods.push(formatDateDash(dt));
    }
  } else if (monthDiff <= 12) {
    periodType = "week";

    let current = new Date();
    while (current >= startDate) {
      periods.unshift(formatDateDash(current));
      current = subWeeks(current, 1);
    }
  } else {
    periodType = "month";

    let current = new Date();
    while (current >= startDate) {
      periods.unshift(formatDateDash(current));
      current = subMonths(current, 1);
    }
  }

  return { periods, periodType };
}

export function mapDateToPeriodKey(
  dateStr: string,
  periodType: AggregationPeriod
): string {
  const date = new Date(dateStr);
  const today = new Date();

  if (periodType === "day") {
    return formatDateDash(date);
  } else if (periodType === "week") {
    const weeksDiff = differenceInCalendarWeeks(today, date, {
      weekStartsOn: 1,
    });
    const periodStart = subWeeks(today, weeksDiff);
    return formatDateDash(periodStart);
  } else {
    const monthsDiff = differenceInCalendarMonths(today, date);
    const periodStart = subMonths(today, monthsDiff);
    return formatDateDash(periodStart);
  }
}

export function stringToOklchColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const lightness = 0.65;
  const chroma = 0.22;
  return `oklch(${lightness} ${chroma} ${hue})`;
}

export function convertSelectedTimeRange(
  selectedTimeRange: InteractiveChartTimeRanges
): [string, string] {
  const today = new Date();

  switch (selectedTimeRange) {
    case "all":
      return ["", ""];
    case "custom":
      return [formatDateDash(), formatDateDash()];
    case "year":
      return [formatDateDash(startOfYear(today)), formatDateDash()];
    case "3m": {
      const start = subMonths(startOfMonth(today), 2);
      const end = endOfMonth(today);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "1m": {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "7d": {
      const start = subDays(today, 7);
      return [formatDateDash(start), formatDateDash()];
    }
    default:
      throw new Error(`Converting Invalid time range ${selectedTimeRange}`);
  }
}

export const isPdf = (src: string, mimeType?: string) => {
  if (mimeType) return mimeType === "application/pdf";
  return src.toLowerCase().endsWith(".pdf");
};

export const buildSupabaseFolderPath = (user: User, transactionId: number) => {
  return `user-${user.id}/transaction-${transactionId}/images`;
};

export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
