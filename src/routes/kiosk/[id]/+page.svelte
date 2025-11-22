<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Redirect based on booking status
	// Status-to-path mapping (adjust status values based on actual API response)
	const statusPathMap: Record<string, string> = {
		booking: `/kiosk/${data.bookingId}/vehicle`,
		vehicleSelected: `/kiosk/${data.bookingId}/protections`,
		rent: `/kiosk/${data.bookingId}/rent`,
		completed: `/kiosk/${data.bookingId}/completed`
		// Add more status mappings as needed
	};

	if (browser)
		data.booking.then((booking) => {
			setTimeout(() => {
				if (booking.redirectPath) goto(booking.redirectPath);
			}, 4000);
		});
</script>

{#await data.booking}
	Wait...
{:then booking}
	Booking status: {booking.booking.status}
{/await}
