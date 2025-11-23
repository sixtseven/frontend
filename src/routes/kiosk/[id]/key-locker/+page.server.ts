import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function load({ params }: RequestEvent) {
    const bookingId = params.id as string;

    try {
        // Fetch booking details
        const bookingResponse = await fetch(
            `https://hackatum25.sixt.io/api/booking/${bookingId}`
        );

        if (!bookingResponse.ok) {
            throw error(bookingResponse.status, `Failed to load booking details: ${bookingResponse.statusText}`);
        }

        const bookingData = await bookingResponse.json();

        return {
            bookingId,
            booking: bookingData
        };
    } catch (err) {
        console.error('Error loading booking for key locker:', err);
        throw error(500, 'Failed to load booking details');
    }
}
