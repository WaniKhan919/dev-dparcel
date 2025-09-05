// 👉 Format currency
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// 👉 Capitalize first letter
export const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// 👉 Format date using Intl (or dayjs if you prefer)
export const formatDate = (date: Date | string, locale = "en-US"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

// 👉 Check if two dates are equal (ignoring time)
export const isSameDate = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// 👉 Generate random ID
export const generateId = (prefix = "id"): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
