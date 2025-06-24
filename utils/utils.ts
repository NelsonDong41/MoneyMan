import { redirect } from "next/navigation";

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

export function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
