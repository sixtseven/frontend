<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Deal, Vehicle } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';

	let { data }: { data: PageData } = $props();

	let selectedVehicleId: string | null = $state(null);
	let isLoading = $state(false);

	onMount(() => {
		// Pre-select the recommended vehicle (second one) if available
		if (data.vehicles.length > 1) {
			selectedVehicleId = data.vehicles[1].vehicle.id;
		} else if (data.vehicles.length > 0) {
			selectedVehicleId = data.vehicles[0].vehicle.id;
		}
	});

	function formatUnit(unit?: string): string {
		switch (unit) {
			case 'EUR':
				return '€';
			case 'USD':
				return '$';
			default:
				return '';
		}
	}

	function formatPrice({
		amount,
		currency,
		prefix
	}: {
		amount: number;
		currency: string;
		prefix: string;
		suffix: string;
	}): string {
		return `${prefix}${amount.toFixed(2)}${formatUnit(currency)}`;
	}

	function getMainImage(vehicle: Vehicle): string {
		return vehicle.images?.[0] || '/placeholder-vehicle.png';
	}

	function getCardAttributes(vehicle: Vehicle): typeof vehicle.attributes {
		return vehicle.attributes.filter((attr) => attr.attributeType === 'CARD_ATTRIBUTE');
	}

	async function handleSelectVehicle(vehicleId: string) {
		selectedVehicleId = vehicleId;
	}

	async function handleConfirm() {
		if (!selectedVehicleId) return;

		isLoading = true;

		try {
			// POST to local API endpoint which proxies to external API
			const response = await fetch(
				`/api/booking/${encodeURIComponent(data.bookingId)}/vehicle/${encodeURIComponent(selectedVehicleId)}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						vehicleId: selectedVehicleId,
						reservationId: data.reservationId
					})
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to confirm vehicle: ${response.statusText}`);
			}

			// Navigate to next step
			window.location.href = `/kiosk/${encodeURIComponent(data.bookingId)}/protections`;
		} catch (err) {
			console.error('Error confirming vehicle:', err);
			alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex-grow bg-white flex flex-col relative">
	<!-- Main content -->
	<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-6">
		<div class="mb-12 flex items-start justify-between gap-8">
			<div class="flex-grow">
				<h1 class="text-4xl font-bold text-gray-900 mb-2">Your Vehicle Selection</h1>
				<p class="text-lg text-gray-600">
					We have a special recommendation for you
				</p>
			</div>
		</div>

		<!-- Original booked vehicle (small card) -->
		{#if data.vehicles.length > 0}
			{@const originalDeal = data.vehicles[0]}
			{@const originalVehicle = originalDeal.vehicle}
			{@const isOriginalSelected = selectedVehicleId === originalVehicle.id}
			
			<div class="mb-8">
				<button
					onclick={() => handleSelectVehicle(originalVehicle.id)}
					class="w-full max-w-xl mx-auto flex items-center bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden p-3 {isOriginalSelected
						? 'ring-2 ring-sixt-orange'
						: 'border border-gray-200'}"
				>
					<!-- Small vehicle image -->
					<div class="w-36 h-24 flex-shrink-0 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg flex items-center justify-center p-2 mr-3 relative">
						<img
							src={getMainImage(originalVehicle)}
							alt="{originalVehicle.brand} {originalVehicle.model}"
							class="max-w-full max-h-full object-contain"
						/>
						
						<!-- Your Original Booking badge -->
						<div class="absolute top-1 left-1 bg-gray-600 text-white px-2 py-1 rounded text-[11px] font-semibold shadow-md">
							Your Original Booking
						</div>
					</div>

					<!-- Vehicle info -->
					<div class="flex-grow text-left">
						<h3 class="text-base font-bold text-gray-900">
							{originalVehicle.brand} {originalVehicle.model}
						</h3>
						<p class="text-xs text-gray-500 mb-1">{originalVehicle.groupType}</p>
						
						{#if originalDeal.pricing.totalPrice.amount === 0}
							<p class="text-xs text-gray-600">included in your booking</p>
						{:else}
							<p class="font-semibold text-sm text-gray-900">
								{formatPrice(originalDeal.pricing.displayPrice)}
								<span class="text-xs font-normal">{originalDeal.pricing.displayPrice.suffix}</span>
							</p>
						{/if}
					</div>

					<!-- Selection indicator -->
					{#if isOriginalSelected}
						<div class="ml-3 bg-sixt-orange text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{/if}
				</button>
			</div>
		{/if}

		<!-- Recommended vehicle (large card) -->
		{#if data.vehicles.length > 1}
			{@const recommendedDeal = data.vehicles[1]}
			{@const recommendedVehicle = recommendedDeal.vehicle}
			{@const isRecommendedSelected = selectedVehicleId === recommendedVehicle.id}
			{@const cardAttrs = getCardAttributes(recommendedVehicle)}
			
			<div class="mb-12 text-center">
				<button
					onclick={() => handleSelectVehicle(recommendedVehicle.id)}
					class="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden {isRecommendedSelected
						? 'ring-4 ring-sixt-orange'
						: 'border-2 border-gray-200'}"
				>
					<!-- Large vehicle image -->
					<div
						class="relative w-full bg-white flex items-center justify-center px-24 py-8"
					>
						<div class="w-full" style="aspect-ratio: 16/9;">
							<img
								src={getMainImage(recommendedVehicle)}
								alt="{recommendedVehicle.brand} {recommendedVehicle.model}"
								class="w-full h-full object-contain"
							/>
						</div>

						<!-- Recommended badge -->
						<div class="absolute top-4 left-4 bg-sixt-orange text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
							⭐ Recommended Upgrade
						</div>

						<!-- Selection indicator -->
						{#if isRecommendedSelected}
							<div class="absolute inset-0 bg-sixt-orange/10 flex items-center justify-center">
								<div class="bg-sixt-orange text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
									<svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							</div>
						{/if}
					</div>

					<!-- Vehicle info section -->
					<div class="p-6">
						<!-- Brand & Model -->
						<h3 class="text-2xl font-bold text-gray-900 text-center mb-1">
							{recommendedVehicle.brand} {recommendedVehicle.model}
						</h3>
						<p class="text-base text-gray-500 text-center mb-4">{recommendedVehicle.groupType}</p>

						<!-- Attributes grid -->
						{#if cardAttrs.length > 0}
							<div class="flex justify-center items-center gap-6 mb-4 py-3 border-y border-gray-200">
								{#each cardAttrs as attr}
									<div class="flex flex-col items-center text-center">
										{#if attr.iconUrl}
											<img src={attr.iconUrl} alt={attr.title} class="w-6 h-6 mb-1" />
										{/if}
										<div class="text-sm font-semibold text-gray-900">{attr.value}</div>
										{#if attr.title}
											<div class="text-xs text-gray-500">{attr.title}</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<!-- Pricing section -->
						<div class="text-center">
							{#if recommendedDeal.pricing.discountPercentage > 0 && recommendedDeal.pricing.listPrice !== undefined}
								<div class="text-base text-gray-500 line-through mb-1">
									{formatPrice(recommendedDeal.pricing.listPrice)}
									{recommendedDeal.pricing.listPrice?.suffix}
								</div>
							{/if}
							{#if recommendedDeal.pricing.totalPrice.amount === 0}
								<div class="text-xl text-gray-600 font-semibold">included</div>
							{:else}
								<div class="font-bold text-3xl text-sixt-orange mb-1">
									<span>{formatPrice(recommendedDeal.pricing.displayPrice)}</span>
									<span class="text-lg font-normal">{recommendedDeal.pricing.displayPrice.suffix}</span>
								</div>
								<div class="text-sm text-gray-600">
									{formatPrice(recommendedDeal.pricing.totalPrice)}
									{recommendedDeal.pricing.totalPrice.suffix}
								</div>
							{/if}
						</div>

						<!-- Why this car - bullet points -->
						<div class="mt-6 pt-6 border-t border-gray-200">
							<h4 class="text-lg font-semibold text-gray-900 mb-4 text-center">Why This Car?</h4>
							<div class="space-y-3 text-left max-w-lg mx-auto">
								<div class="flex items-start gap-3">
									<svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
									</svg>
									<p class="text-green-700 font-medium">Spacious interior - perfect for families with 5+ passengers</p>
								</div>
								<div class="flex items-start gap-3">
									<svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
									</svg>
									<p class="text-green-700 font-medium">Large trunk space for all your luggage and equipment</p>
								</div>
								<div class="flex items-start gap-3">
									<svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
									</svg>
									<p class="text-green-700 font-medium">Premium comfort features for long-distance travel</p>
								</div>
							</div>
						</div>
					</div>
				</button>
			</div>
		{/if}

		<!-- Confirm button -->
		<div class="flex justify-center gap-4">
			<button
				onclick={() => window.history.back()}
				class="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded shadow transition"
				disabled={isLoading}
			>
				Back
			</button>
			<button
				onclick={handleConfirm}
				disabled={!selectedVehicleId || isLoading}
				class="px-12 py-3 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Confirming...' : 'Confirm Selection'}
			</button>
		</div>
	</main>
	
	<!-- Avatar positioned at bottom right -->
	<div class="fixed bottom-8 right-8 scale-150">
		<SpeakingAvatar
			text="We found the perfect car for you! We recommend this vehicle because it has a spacious interior perfect for families with 5 or more passengers, large trunk space for all your luggage and equipment, and premium comfort features for long-distance travel."
			idleImageUrl="/avatar-closed.png"
			speakingImageUrl="/avatar-open.png"
			useElevenLabs={true}
			autoSpeak={true}
		/>
	</div>
</div>
