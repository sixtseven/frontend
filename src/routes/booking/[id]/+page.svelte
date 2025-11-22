<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let qrCode: string | null = null;
	let bookingId: string = '';

	onMount(async () => {
		bookingId = $page.params.id ?? '';

		if (bookingId) {
			// Generate QR code with the full URL
			const bookingUrl = `${window.location.origin}/booking/${bookingId}`;
			const qrCodeDataUrl = await QRCode.toDataURL(bookingUrl, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});
			qrCode = qrCodeDataUrl;
		}
	});

	function downloadQRCode() {
		if (qrCode) {
			const link = document.createElement('a');
			link.href = qrCode;
			link.download = `booking-${bookingId}.png`;
			link.click();
		}
	}

	function goBack() {
		window.location.href = '/';
	}
</script>

<div class="min-h-screen bg-white font-sixt flex flex-col">
	<!-- Orange banner at top -->
	<div class="bg-sixt-orange h-1"></div>

	<!-- Header with SIXT logo -->
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
			<img src="/sixt.svg" alt="SIXT" class="h-8 w-auto" />
			<div class="text-sm text-gray-600 uppercase tracking-widest font-semibold">
				Key Vending System
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main
		class="max-w-5xl mx-auto px-6 py-20 flex-grow w-full flex flex-col items-center justify-center"
	>
		<div class="text-center">
			<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Booking Confirmed!</h1>

			<p class="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
				Hold your phone to the scanner of the key vending machine to retrieve your key.
			</p>

			<!-- QR Code Display -->
			<div
				class="bg-white p-12 rounded-lg shadow-2xl inline-block mb-12 border-4 border-sixt-orange"
			>
				{#if qrCode}
					<img src={qrCode} alt="Booking QR Code" class="w-96 h-96" />
				{:else}
					<div class="w-96 h-96 flex items-center justify-center">
						<p class="text-gray-600">Generating QR code...</p>
					</div>
				{/if}
			</div>

			<!-- Booking ID -->
			<div class="mb-12">
				<p class="text-gray-600 text-lg mb-4 uppercase tracking-widest">Your Booking ID:</p>
				<p class="text-4xl font-bold text-sixt-orange font-mono break-all">{bookingId}</p>
			</div>

			<!-- Action buttons -->
			<div class="flex gap-6 justify-center flex-wrap">
				<button
					on:click={downloadQRCode}
					class="px-12 py-4 bg-sixt-orange hover:bg-orange-700 text-white font-bold text-lg rounded transition-all duration-300 transform hover:scale-105 shadow-lg"
				>
					Download QR Code
				</button>

				<button
					on:click={goBack}
					class="px-12 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg rounded transition-all duration-300 transform hover:scale-105 shadow-lg"
				>
					Back
				</button>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
		<div class="max-w-7xl mx-auto text-center text-sm">
			<p class="uppercase tracking-widest">
				&copy; 2025 SIXT. All rights reserved. | Automated Key Vending System
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #ffffff;
	}
</style>
