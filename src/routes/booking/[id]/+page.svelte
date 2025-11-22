<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { goto } from '$app/navigation';

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
		goto('/booking');
	}
</script>

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
		<div class="flex justify-center mb-12">
			<div
				class="bg-white p-8 md:p-12 rounded-lg shadow-2xl border-4 border-sixt-orange max-w-sm w-full"
			>
				{#if qrCode}
					<img src={qrCode} alt="Booking QR Code" class="w-full h-auto aspect-square" />
				{:else}
					<div class="w-full aspect-square flex items-center justify-center">
						<p class="text-gray-600">Generating QR code...</p>
					</div>
				{/if}
			</div>
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

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #ffffff;
	}
</style>
