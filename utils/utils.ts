import { redirect } from "next/navigation";
import { InteractiveChartTimeRanges } from "@/context/TransactionsContext";

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

export function formatDateHuman(date: Date | undefined) {
  if (!date) {
    return undefined;
  }

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
