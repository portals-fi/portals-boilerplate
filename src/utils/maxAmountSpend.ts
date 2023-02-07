const MIN_NATIVE_CURRENCY_FOR_GAS = 0.01 as const;

/**
 * Given some token amount, return the max that can be spent of it (inspired by portals.fi method for this)
 * @param amount to return max of
 * @param token to get the decimals
 */
export function maxAmountSpend(amount: number, isNative: boolean): number {
  return isNative
    ? amount > MIN_NATIVE_CURRENCY_FOR_GAS
      ? amount - MIN_NATIVE_CURRENCY_FOR_GAS
      : 0
    : amount;
}
