import { getLocale } from "@/paraglide/runtime";

function intlLocale() {
  return getLocale() === "zh" ? "zh-CN" : "en-US";
}

/** A whole number with the locale's thousands separators. */
export function formatCount(value: number) {
  return new Intl.NumberFormat(intlLocale()).format(value);
}

/** A popularity window's first to last UTC day, e.g. "Sep 14 – Oct 13". */
export function formatWindow(start: number, end: number) {
  return new Intl.DateTimeFormat(intlLocale(), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).formatRange(new Date(start), new Date(end));
}
