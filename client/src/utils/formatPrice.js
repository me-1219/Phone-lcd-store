import { CURRENCY } from "./constants";

/**
 * Formats a number as a price string, e.g. formatPrice(1800) -> "ETB 1,800"
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return `${CURRENCY} 0`;
  }

  return `${CURRENCY} ${Number(amount).toLocaleString("en-US")}`;
};
