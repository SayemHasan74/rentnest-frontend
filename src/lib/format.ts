export const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "BDT",
  }).format(Number(value));

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(value);
