<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface PageState {
		isLoading: boolean;
		error: string | null;
	}

	interface BookingItem {
		id: string;
		timestamp: number;
	}

	let state: PageState = {
		isLoading: false,
		error: null
	};

	let recentBookings: BookingItem[] = [];

	onMount(() => {
		// Load recent bookings from localStorage
		const stored = localStorage.getItem('sixt_bookings');
		if (stored) {
			try {
				recentBookings = JSON.parse(stored);
			} catch {
				recentBookings = [];
			}
		}
	});

	async function createBooking() {
		state.isLoading = true;
		state.error = null;

		try {
			const response = await fetch('/api/booking', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();

			// Store booking ID in localStorage
			const newBooking: BookingItem = {
				id: data.id,
				timestamp: Date.now()
			};

			// Add to recent bookings and keep only the last 5
			recentBookings = [newBooking, ...recentBookings].slice(0, 5);
			localStorage.setItem('sixt_bookings', JSON.stringify(recentBookings));

			// Redirect to booking page with the ID
			goto(`/booking/${data.id}`);
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			state.isLoading = false;
		}
	}

	function goToBooking(bookingId: string) {
		goto(`/booking/${bookingId}`);
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleString();
	}
</script>

<!-- Hero section with background -->
<section class="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-24 px-6">
	<div class="max-w-5xl mx-auto text-center">
		<h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">Keys on Demand</h1>
		<p class="text-xl md:text-2xl mb-12 text-gray-300">
			Book your rental car and retrieve the key quickly and easily from our automated key vending
			system
		</p>

		<!-- Create booking button -->
		<button
			on:click={createBooking}
			disabled={state.isLoading}
			class="px-16 py-4 bg-sixt-orange hover:bg-orange-700 text-white font-bold text-lg rounded transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
		>
			{state.isLoading ? 'Creating...' : 'Create Booking'}
		</button>

		{#if state.error}
			<div
				class="mt-8 p-6 bg-red-900 bg-opacity-50 border-2 border-red-400 rounded-lg text-left max-w-md mx-auto"
			>
				<p class="font-semibold mb-2">Error:</p>
				<p class="text-gray-100">{state.error}</p>
			</div>
		{/if}
	</div>
</section>

<!-- Main content -->
<main class="max-w-7xl mx-auto px-6 py-20 flex-grow w-full">
	<!-- Features section -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div
			class="bg-white p-8 rounded-lg shadow-md border-l-4 border-sixt-orange hover:shadow-xl transition-shadow"
		>
			<div class="text-4xl mb-4">🕐</div>
			<h3 class="text-2xl font-bold text-gray-900 mb-4">24/7</h3>
			<p class="text-gray-600">Available anytime, day or night for key retrieval.</p>
		</div>

		<div
			class="bg-white p-8 rounded-lg shadow-md border-l-4 border-sixt-orange hover:shadow-xl transition-shadow"
		>
			<div class="text-4xl mb-4">⚡</div>
			<h3 class="text-2xl font-bold text-gray-900 mb-4">Fast</h3>
			<p class="text-gray-600">Receive your booking code immediately after booking.</p>
		</div>

		<div
			class="bg-white p-8 rounded-lg shadow-md border-l-4 border-sixt-orange hover:shadow-xl transition-shadow"
		>
			<div class="text-4xl mb-4">📱</div>
			<h3 class="text-2xl font-bold text-gray-900 mb-4">Easy</h3>
			<p class="text-gray-600">Scan the QR code and get your key instantly.</p>
		</div>
	</div>

	<!-- Recent Bookings Section -->
	{#if recentBookings.length > 0}
		<div class="mt-20 pt-12 border-t-2 border-gray-200">
			<h2 class="text-3xl font-bold text-gray-900 mb-8">Recent Bookings</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
				{#each recentBookings as booking (booking.id)}
					<button
						on:click={() => goToBooking(booking.id)}
						class="bg-white p-6 rounded-lg shadow-md border-t-4 border-sixt-orange hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
					>
						<div class="text-sixt-orange text-xs uppercase tracking-wider font-semibold mb-2">
							Booking ID
						</div>
						<div class="text-gray-900 font-mono text-sm mb-3 break-all font-semibold">
							{booking.id}
						</div>
						<div class="text-gray-500 text-xs">{formatDate(booking.timestamp)}</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #ffffff;
	}
</style>
