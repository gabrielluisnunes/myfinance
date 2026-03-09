export function formatCurrency(
  amount: number | string,
  currency = "BRL",
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    value,
  );
}

function parseDateLocal(dateString: string): Date {
  // Always parse just the YYYY-MM-DD portion in local time to avoid
  // UTC-to-local timezone shift (e.g. "2026-03-09T00:00:00Z" → Mar 8 in UTC-3)
  const datePart = dateString.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(dateString: string): string {
  const date = parseDateLocal(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  const date = parseDateLocal(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(dateString: string): string {
  const date = parseDateLocal(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return formatDate(dateString);
}
