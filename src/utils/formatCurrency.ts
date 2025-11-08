export type FormatCurrencyOptions = {
  locale?: string; // e.g. 'en-US', 'tr-TR'
  maximumFractionDigits?: number; // default 10
  symbol?: string; // e.g. '$', '€', '₺' - appended or prepended based on symbolPosition
  symbolPosition?: "start" | "end"; // default 'start'
  useGrouping?: boolean; // thousands separator, default true
};

export function formatCurrency(
  value: number | string | null | undefined,
  opts: FormatCurrencyOptions = {}
): string {
  const {
    locale = "en-US",
    maximumFractionDigits = 10,
    symbol,
    symbolPosition = "start",
    useGrouping = true,
  } = opts;

  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);
  if (!isFinite(num)) return String(value);

  const formatter = new Intl.NumberFormat(locale, {
    useGrouping,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });

  let formatted = formatter.format(num);

  if (/[eE]/.test(formatted)) {
    const fixed = num.toFixed(maximumFractionDigits);
    formatted = fixed
      .replace(/(?:\.0+|(?<=\.[0-9]*?)0+)$/, "")
      .replace(/\.$/, "");
  }

  if (symbol) {
    formatted =
      symbolPosition === "start"
        ? `${symbol}${formatted}`
        : `${formatted}${symbol}`;
  }

  return formatted;
}

export default formatCurrency;
