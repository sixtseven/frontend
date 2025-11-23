/**
 * Format currency unit symbol
 */
export function formatCurrencyUnit(unit?: string): string {
	switch (unit) {
		case 'EUR':
			return '€';
		case 'USD':
			return '$';
		default:
			return unit || '';
	}
}

/**
 * Format price from API pricing object (for vehicles/deals)
 * Handles prefix/suffix and already-formatted amounts
 */
export function formatDealPrice({
	amount,
	currency,
	prefix,
	suffix
}: {
	amount: number;
	currency: string;
	prefix: string;
	suffix: string;
}): string {
	return `${prefix}${amount.toFixed(2)}${formatCurrencyUnit(currency)}${suffix || ''}`;
}

/**
 * Format price for addons/protections
 * Amount is already in the correct unit (not cents)
 */
export function formatPrice(
	amount: number,
	currency?: string,
	suffix?: string
): string {
	const currencySymbol = currency ? formatCurrencyUnit(currency) : '';
	const formattedSuffix = suffix || '';
	return `${currencySymbol}${amount.toFixed(2)}${formattedSuffix}`;
}
