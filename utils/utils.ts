import { redirect } from "next/navigation";
import { InteractiveChartTimeRanges } from "@/context/TransactionsContext";
import { TimeFrame } from "./schemas/categorySpendLimitFormSchema";

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

export function formatDateHuman(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateDash(date: Date): string {
  const [month, day, year] = date
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    })
    .split("/");

  return `${year}-${month}-${day}`;
}

export function getRandomDate(startDate: Date, endDate: Date) {
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();
  const randomMillis = startMillis + Math.random() * (endMillis - startMillis);
  return new Date(randomMillis);
}

// assume date is of type yyyy-mm-dd
export const getFirstDateOfYear = (dateStr: string): string => {
  const [yearStr, _monthStr, _dayStr] = dateStr.split("-");
  const year = Number(yearStr);

  const firstDayOfYear = new Date(year, 0, 1);

  return formatDateDash(firstDayOfYear);
};

// assume date is of type yyyy-mm-dd
export const getFirstDateOfMonth = (dateStr: string): string => {
  const [yearStr, monthStr, _dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const firstDayOfMonth = new Date(year, month - 1, 1);

  return formatDateDash(firstDayOfMonth);
};

// assume date is of type yyyy-mm-dd
export const getFirstDayOfWeek = (date: string): string => {
  const dt = new Date(date);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  return formatDateDash(dt);
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
  const [yearStr, _monthStr, _dayStr] = dateStr.split("-");
  const year = Number(yearStr);

  const lastDayOfYear = new Date(year, 12, 0);

  return formatDateDash(lastDayOfYear);
};

// assume date is of type yyyy-mm-dd
export const getLastDateOfMonth = (date: string): string => {
  const [yearStr, monthStr, _dayStr] = date.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const lastDate = new Date(year, month, 0);

  return formatDateDash(lastDate);
};

// assume date is of type yyyy-mm-dd
export const getLastDayOfWeek = (date: string): string => {
  const dt = new Date(date);
  dt.setDate(dt.getDate() - dt.getDay() + 7 - 1);
  return formatDateDash(dt);
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
  const [yearStr, monthStr, dateStr] = date.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dateStr, 10);
  const nextDate = new Date(year, month - 1, day + 1);
  return formatDateDash(nextDate);
};

export const getLastMonth = (date: string): string => {
  const [yearStr, monthStr, dateStr] = date.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dateStr, 10);
  const nextDate = new Date(year, month - 2, day);
  return formatDateDash(nextDate);
};

export function getRandomFloatTwoDecimalPlaces(min: number, max: number) {
  const randomNumberScaled =
    Math.random() * (max * 100 - min * 100) + min * 100;

  const roundedNumber = Math.round(randomNumberScaled);

  const finalNumber = roundedNumber / 100;

  return finalNumber;
}

export function getDaysInDateRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function generateRandomString(length: number) {
  const result = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  return result;
}

export function getAllDatesInRange(
  timeRange: [string, string],
  firstDate: string
): string[] {
  let [start, end] = timeRange;
  if (!timeRange[0] && !timeRange[1]) {
    start = firstDate;
    end = formatDateDash(new Date());
  }
  if (start === end) return [start];
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  let startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  while (startDate <= endDate) {
    dates.push(formatDateDash(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
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
      return [formatDateDash(today), formatDateDash(today)];
    case "year":
      return [
        formatDateDash(new Date(today.getFullYear(), 0, 1)),
        formatDateDash(today),
      ];
    case "3m": {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "1m": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [formatDateDash(start), formatDateDash(end)];
    }
    case "7d": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      const end = today;
      return [formatDateDash(start), formatDateDash(end)];
    }
    default:
      throw new Error(`Converting Invalid time range ${selectedTimeRange}`);
  }
}
