import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function load({ params }: RequestEvent) {
	const bookingId = params.id as string;

	try {
		// Fetch both booking details and addon groups in parallel
		const [bookingResponse, addonsResponse] = await Promise.all([
			fetch(`https://hackatum25.sixt.io/api/booking/${bookingId}`),
			fetch(`https://hackatum25.sixt.io/api/booking/${bookingId}/addons`)
		]);

		if (!bookingResponse.ok) {
			throw error(bookingResponse.status, `Failed to load booking details: ${bookingResponse.statusText}`);
		}

		const bookingData = await bookingResponse.json();
		
		// Addon groups are optional - don't fail if they can't be loaded
		let addonGroups = [];
		if (addonsResponse.ok) {
			const addonsData = await addonsResponse.json();
			addonGroups = addonsData.addons || [];
		}

		return {
			bookingId,
			booking: {
				...bookingData,
				addonGroups
			}
		};
	} catch (err) {
		console.error('Error loading booking summary:', err);
		throw error(500, 'Failed to load booking summary');
	}
}
