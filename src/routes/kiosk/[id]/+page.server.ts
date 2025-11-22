import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface BookingResponse {
    id: string;
    status: string;
    [key: string]: unknown;
}

export const load: PageServerLoad = async ({ params }) => {
    const bookingId = params.id;

    const booking: Promise<{ booking: BookingResponse, redirectPath: string | undefined }> = fetch(`https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}`).then(async (response) => {
        const booking = await response.json();

        // Redirect based on booking status
        // Status-to-path mapping (adjust status values based on actual API response)
        const statusPathMap: Record<string, string> = {
            booking: `/kiosk/${bookingId}/vehicle`,
            vehicleSelected: `/kiosk/${bookingId}/protections`,
            rent: `/kiosk/${bookingId}/addons`,
            completed: `/kiosk/${bookingId}/completed`
            // Add more status mappings as needed
        };

        const redirectPath = statusPathMap[booking.status];

        return { booking, redirectPath }
    });

    return { bookingId, booking }

};
