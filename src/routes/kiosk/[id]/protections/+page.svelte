<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProtectionPackage } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';

	interface Props {
		data: {
			bookingId: string;
			packages: ProtectionPackage[];
		};
	}

	let { data }: Props = $props();

	let selectedProtectionId: string | null = $state(null);
	let isLoading = $state(false);

	onMount(() => {
		// Pre-select the default (already selected or first) protection
		const defaultProtection = data.packages.find((pkg) => pkg.isSelected);
		if (defaultProtection) {
			selectedProtectionId = defaultProtection.id;
		} else if (data.packages.length > 0) {
			selectedProtectionId = data.packages[0].id;
		}
	});

	function formatPrice(amount: number): string {
		return amount.toFixed(2);
	}

	function getStarRating(stars: number): string {
		return '⭐'.repeat(Math.max(stars, 0));
	}

	async function handleConfirm() {
		if (!selectedProtectionId) return;

		isLoading = true;

		try {
			// POST to local API endpoint which proxies to external API
			const response = await fetch(
				`/api/booking/${encodeURIComponent(data.bookingId)}/protections/${encodeURIComponent(selectedProtectionId)}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to confirm protection: ${response.statusText}`);
			}

			// Navigate to next step (rent or completed)
			window.location.href = `/kiosk/${encodeURIComponent(data.bookingId)}/rent`;
		} catch (err) {
			console.error('Error confirming protection:', err);
			alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Main content -->
<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">Choose Your Protection</h1>
		<p class="text-lg text-gray-600">Select a protection package for your rental</p>
	</div>

	<!-- Protection packages grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
		{#each data.packages as pkg (pkg.id)}
			{@const isSelected = selectedProtectionId === pkg.id}
			<button
				onclick={() => (selectedProtectionId = pkg.id)}
				class="relative flex flex-col text-left bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 {isSelected
					? 'ring-2 ring-sixt-orange'
					: 'border border-gray-200'}"
			>
				<!-- Header with name and price -->
				<div class="flex justify-between items-start mb-4">
					<div class="flex-grow">
						<h3 class="text-xl font-bold text-gray-900">{pkg.name}</h3>
						{#if pkg.ratingStars > 0}
							<div class="text-sm text-gray-600 mt-1">{getStarRating(pkg.ratingStars)}</div>
						{/if}
					</div>
					<div class="text-right ml-4">
						{#if pkg.price.discountPercentage > 0}
							<div class="text-sm text-gray-500 line-through">
								{pkg.price.listPrice?.amount && formatPrice(pkg.price.listPrice.amount)}
							</div>
						{/if}
						<div class="font-bold text-lg text-sixt-orange">
							{formatPrice(pkg.price.displayPrice.amount)}
							<span class="text-sm">{pkg.price.displayPrice.suffix}</span>
						</div>
						{#if pkg.price.discountPercentage > 0}
							<div class="text-xs text-green-600 font-semibold">
								{pkg.price.discountPercentage}% off
							</div>
						{/if}
					</div>
				</div>

				<!-- Description -->
				{#if pkg.description}
					<p class="text-sm text-gray-600 mb-4">{pkg.description}</p>
				{/if}

				<!-- Includes section -->
				{#if pkg.includes.length > 0}
					<div class="mb-4">
						<h4 class="text-sm font-semibold text-gray-900 mb-2">Includes:</h4>
						<ul class="space-y-2">
							{#each pkg.includes as coverage}
								<li class="flex items-start gap-2 text-sm text-gray-700">
									<span class="text-sixt-orange font-bold mt-0.5">✓</span>
									<div>
										<div class="font-medium">{coverage.title}</div>
										<div class="text-xs text-gray-600">{coverage.description}</div>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Excludes section -->
				{#if pkg.excludes.length > 0}
					<div class="mb-4 pt-4 border-t border-gray-200">
						<h4 class="text-sm font-semibold text-gray-900 mb-2">Does not include:</h4>
						<ul class="space-y-1">
							{#each pkg.excludes as coverage}
								<li class="flex items-start gap-2 text-xs text-gray-600">
									<span class="text-gray-400 mt-0.5">–</span>
									<span>{coverage.title}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Selection indicator -->
				{#if isSelected}
					<div class="mt-auto pt-4 border-t border-sixt-orange/20">
						<div class="flex items-center gap-2 text-sixt-orange font-semibold">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
							Selected
						</div>
					</div>
				{/if}
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
			disabled={!selectedProtectionId || isLoading}
			class="px-12 py-3 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? 'Confirming...' : 'Confirm Protection'}
		</button>
	</div>
</main>
