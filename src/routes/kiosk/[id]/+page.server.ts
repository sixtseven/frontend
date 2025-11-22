import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Recommendations } from '$lib/stores';

interface BookingResponse {
    id: string;
    status: string;
    [key: string]: unknown;
}

export const load: PageServerLoad = async ({ params }) => {
    const bookingId = params.id;

    const booking: Promise<{ booking: BookingResponse, redirectPath: string | undefined }> = fetch(`https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}`).then(async (response) => {
        if (!response.ok)
            throw error(response.status, response.statusText)

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

    const recommendation: Promise<Recommendations> = fetch("http://127.0.0.1:9000/api/booking/Q80chI4GLq4d4D3UR9p5/recommend").then((response) => response.json())

    return { bookingId, booking, recommendation }

};
