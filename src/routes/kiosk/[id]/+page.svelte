<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';
	import { recommendationsStore } from '$lib/stores';

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

	let redirectPath: string | undefined = $state(undefined);

	if (browser) {
		data.booking
			.then((booking) => {
				redirectPath = booking.redirectPath;
			})
			.catch(() => {
				goto('/kiosk?error=notfound');
			});

		data.recommendation
			.then((recommendation) => recommendationsStore.set(recommendation))
			.catch((e) => {
				console.error(e);
				recommendationsStore.set(undefined);
			});
	}

	function handleSpeechEnd() {
		if (redirectPath) {
			goto(redirectPath);
		}
	}
</script>

<div class="flex-grow bg-white flex items-center justify-center">
	<div class="w-full h-full flex items-center justify-center">
		{#await data.booking}
			<div class="flex flex-col items-center gap-8">
				<div style="transform: scale(3);">
					<SpeakingAvatar
						text="Welcome! Let me load your booking information."
						variant="minimal"
						useElevenLabs={true}
						autoSpeak={false}
					/>
				</div>

				<div class="mt-16">
					<div
						class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"
					></div>
				</div>
			</div>
		{:then booking}
			<div class="flex flex-col items-center justify-center">
				<div style="transform: scale(3);">
					<SpeakingAvatar
						text="Welcome! Let me load your booking information."
						variant="minimal"
						useElevenLabs={true}
						autoSpeak={true}
						onSpeechEnd={handleSpeechEnd}
					/>
				</div>
			</div>
		{/await}
	</div>
</div>
