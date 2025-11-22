<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Deal, Vehicle } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';

	let { data }: { data: PageData } = $props();

	let selectedVehicleId: string | null = $state(null);
	let isLoading = $state(false);

	onMount(() => {
		// Pre-select the first vehicle if available
		if (data.vehicles.length > 0) {
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

<div class="min-h-screen bg-white flex flex-col">
	<!-- Main content -->
	<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Select Your Vehicle</h1>
			<p class="text-lg text-gray-600">
				Choose from {data.totalVehicles} available vehicles
			</p>
		</div>

		<!-- Vehicle grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
			{#each data.vehicles as deal (deal.vehicle.id)}
				{@const vehicle = deal.vehicle}
				{@const isSelected = selectedVehicleId === vehicle.id}
				{@const cardAttrs = getCardAttributes(vehicle)}
				<button
					onclick={() => handleSelectVehicle(vehicle.id)}
					class="relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden {isSelected
						? 'ring-2 ring-sixt-orange'
						: 'border border-gray-200'}"
				>
					<!-- Image container with fixed aspect ratio -->
					<div
						class="relative w-full bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center p-4"
						style="aspect-ratio: 16/10;"
					>
						<img
							src={getMainImage(vehicle)}
							alt="{vehicle.brand} {vehicle.model}"
							class="max-w-full max-h-full object-contain"
						/>

						<!-- Recommended/Discount badge -->
						{#if vehicle.isRecommended || deal.dealInfo === 'DISCOUNT'}
							<div
								class="absolute top-3 left-3 bg-sixt-orange text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
							>
								{#if vehicle.isRecommended}
									⭐ Recommended
								{:else if deal.dealInfo === 'DISCOUNT'}
									🎉 Discount
								{/if}
							</div>
						{/if}

						<!-- Selection indicator -->
						{#if isSelected}
							<div class="absolute inset-0 bg-sixt-orange/10 flex items-center justify-center">
								<div
									class="bg-sixt-orange text-white rounded-full w-12 h-12 flex items-center justify-center"
								>
									<svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
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
					<div class="p-4 flex flex-col flex-grow">
						<!-- Brand & Model -->
						<h3 class="text-base font-bold text-gray-900 text-center">
							{vehicle.brand}
							{vehicle.model}
						</h3>
						<p class="text-xs text-gray-500 text-center mb-3">{vehicle.groupType}</p>

						<!-- Attributes grid -->
						{#if cardAttrs.length > 0}
							<div
								class="flex justify-center items-center gap-4 mb-4 py-2 border-y border-gray-100"
							>
								{#each cardAttrs as attr}
									<div class="flex flex-col items-center text-center">
										{#if attr.iconUrl}
											<img src={attr.iconUrl} alt={attr.title} class="w-5 h-5 mb-1" />
										{/if}
										<div class="text-xs font-semibold text-gray-900">{attr.value}</div>
										{#if attr.title}
											<div class="text-xs text-gray-500">{attr.title}</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<!-- Pricing section -->
						<div class="mt-auto text-center">
							{#if deal.pricing.discountPercentage > 0 && deal.pricing.listPrice !== undefined}
								<div class="text-xs text-gray-500 line-through mb-1">
									{formatPrice(deal.pricing.listPrice)}
									{deal.pricing.listPrice?.suffix}
								</div>
							{/if}
							{#if deal.pricing.totalPrice.amount === 0}
								<div class="text-md text-gray-600 mb-5">included</div>
							{:else}
								<div class="font-bold text-lg text-sixt-orange">
									<span>{formatPrice(deal.pricing.displayPrice)}</span>
									<span class="text-xs font-normal">{deal.pricing.displayPrice.suffix}</span>
								</div>
								<div class="text-xs text-gray-600 mt-1">
									{formatPrice(deal.pricing.totalPrice)}
									{deal.pricing.totalPrice.suffix}
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>

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
</div>
