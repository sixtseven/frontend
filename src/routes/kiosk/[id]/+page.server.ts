import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface BookingResponse {
    id: string;
    status: string;
    [key: string]: unknown;
}

export const load: PageServerLoad = async ({ params }) => {
    const bookingId = params.id;

    try {
        // Fetch booking status from external API
        const response = await fetch(`https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}`);

        if (!response.ok) {
            // If booking not found or error, return error page
            throw error(response.status, `Booking not found or API error: ${response.statusText}`);
        }

        const booking: BookingResponse = await response.json();

        // Redirect based on booking status
        // Status-to-path mapping (adjust status values based on actual API response)
        const statusPathMap: Record<string, string> = {
            booking: `/kiosk/${bookingId}/vehicle`,
            vehicleSelected: `/kiosk/${bookingId}/protections`,
            rent: `/kiosk/${bookingId}/rent`,
            completed: `/kiosk/${bookingId}/completed`
            // Add more status mappings as needed
        };

        const redirectPath = statusPathMap[booking.status];

        if (redirectPath) {
            throw redirect(307, redirectPath);
        }

        // If status doesn't match any known path, throw error
        throw error(400, `Unknown booking status: ${booking.status}`);
    } catch (err) {
        // If it's a SvelteKit redirect or error, re-throw it
        if (err instanceof Object && 'status' in err) {
            throw err;
        }

        // Network or parsing error
        throw error(500, `Failed to load booking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};
