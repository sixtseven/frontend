<script lang="ts">
	import { goto } from '$app/navigation';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';

	interface Props {
		data: {
			bookingId: string;
			booking: any;
		};
	}

	let { data }: Props = $props();

	let isActivating = $state(false);
	let isActivated = $state(false);
	let error_message = $state('');
	let avatarText = $state(
		'Press the button below to activate the key locker and retrieve your keys.'
	);

	async function handleActivateKeyLocker() {
		isActivating = true;
		error_message = '';

		try {
			// POST to trigger-broadcast endpoint via server API
			const response = await fetch('/api/trigger-broadcast', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Failed to activate key locker');
			}

			// Update state and avatar text on success
			isActivated = true;

			setTimeout(() => goto(`/kiosk/${data.bookingId}/summary`), 2000);
		} catch (err) {
			console.error('Error activating key locker:', err);
			error_message = err instanceof Error ? err.message : 'Unknown error occurred';
		} finally {
			isActivating = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
	<!-- Main content -->
	<main class="flex-grow max-w-4xl w-full mx-auto px-6 py-12">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Activate Key Locker</h1>
			<p class="text-lg text-gray-600">
				Reservation ID: <span class="font-mono font-bold">{data.bookingId}</span>
			</p>
		</div>

		<!-- Main Card -->
		<div class="bg-white rounded-xl shadow-lg p-12 border border-gray-200 mb-8">
			<!-- Illustration -->
			<div class="text-center mb-8">
				<div
					class="inline-flex items-center justify-center w-24 h-24 bg-sixt-orange rounded-full mb-6"
				>
					<span class="text-5xl">🔑</span>
				</div>
			</div>

			<!-- Instructions -->
			<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
				<h2 class="text-xl font-bold text-blue-900 mb-4">How It Works</h2>
				<div class="space-y-3 text-blue-800">
					<div class="flex items-start gap-3">
						<span
							class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0"
							>1</span
						>
						<p>Click the "Activate Key Locker" button below</p>
					</div>
					<div class="flex items-start gap-3">
						<span
							class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0"
							>2</span
						>
						<p>The locker will unlock and the key will drop out</p>
					</div>
					<div class="flex items-start gap-3">
						<span
							class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0"
							>3</span
						>
						<p>Head to your vehicle location</p>
					</div>
				</div>
			</div>

			<!-- Vehicle Info -->
			{#if data.booking.selectedVehicle?.vehicle}
				{@const vehicle = data.booking.selectedVehicle.vehicle}
				<div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
					<h3 class="text-sm font-bold text-gray-600 uppercase mb-3">Your Vehicle</h3>
					<p class="text-2xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</p>
					{#if vehicle.groupType}
						<p class="text-sm text-gray-600">{vehicle.groupType}</p>
					{/if}
				</div>
			{/if}

			<!-- Error message -->
			{#if error_message}
				<div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
					<p class="text-red-800 font-semibold">❌ Error: {error_message}</p>
				</div>
			{/if}

			<!-- Primary Action Button -->
			<button
				onclick={handleActivateKeyLocker}
				disabled={isActivating || isActivated}
				class="w-full px-8 py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-2xl rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isActivating
					? '⏳ Processing...'
					: isActivated
						? '✓ Key Locker Activated'
						: '🔓 Activate Key Locker'}
			</button>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-gray-800 text-white py-6 mt-12">
		<div class="max-w-4xl mx-auto px-6 text-center">
			<p class="text-sm text-gray-400">Have a safe and enjoyable journey with SIXT!</p>
		</div>
	</footer>

	<!-- Avatar positioned at bottom right -->
	<div class="fixed bottom-8 right-8 scale-150">
		<SpeakingAvatar text={avatarText} variant="premium" useElevenLabs={true} autoSpeak={true} />
	</div>
</div>
