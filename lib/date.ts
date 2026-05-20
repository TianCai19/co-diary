export function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDayDiff(previous: Date, current: Date) {
  const previousStart = getStartOfDay(previous).getTime();
  const currentStart = getStartOfDay(current).getTime();
  return Math.round((currentStart - previousStart) / (1000 * 60 * 60 * 24));
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function isSameDay(left: Date, right: Date) {
  return getStartOfDay(left).getTime() === getStartOfDay(right).getTime();
}
