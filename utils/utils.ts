import tailwindConfig from "@/tailwind.config";
import { redirect } from "next/navigation";
import resolveConfig from "tailwindcss/resolveConfig";
import { Type } from "./supabase/supabase";
import { Tables } from "./supabase/types";

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

export function categoryDataToMap(categoryData: Tables<"Category">[]) {
  const categoryMap: Record<Type, Record<string, any[]>> = {
    Expense: {},
    Income: {},
  };

  categoryData.forEach(({ category, ParentCategory, type }) => {
    const parentId = ParentCategory;

    if (parentId) {
      if (categoryMap[type][parentId]) {
        categoryMap[type][parentId].push(category);
      } else {
        categoryMap[type][parentId] = [parentId, category];
      }
    }

    if (!parentId && !categoryMap[type][category]) {
      categoryMap[type][category] = [category];
    }
  });

  return categoryMap;
}

export function getAllDatesInRange(start: string, end: string): string[] {
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
