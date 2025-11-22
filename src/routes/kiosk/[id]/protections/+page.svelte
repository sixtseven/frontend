<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProtectionPackage } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: {
			bookingId: string;
			packages: ProtectionPackage[];
		};
	}

	let { data }: Props = $props();

	let selectedProtectionId: string | null = $state(null);
	let isLoading = $state(false);

	// Find the best protection (highest rating stars or marked as nudge)
	const bestProtection = $derived(
		data.packages.reduce((best, pkg) => {
			if (!best) return pkg;
			if (pkg.isNudge) return pkg;
			if (best.isNudge) return best;
			if (pkg.ratingStars > best.ratingStars) return pkg;
			return best;
		}, data.packages[0])
	);

	// Find the worst protection (lowest rating stars)
	const worstProtection = $derived(
		data.packages.reduce((worst, pkg) => {
			if (!worst) return pkg;
			if (pkg.ratingStars < worst.ratingStars) return pkg;
			return worst;
		}, data.packages[0])
	);

	// Determine avatar variant based on selected protection
	const avatarVariant = $derived<'premium' | 'medium' | 'minimal'>(
		selectedProtectionId === bestProtection?.id ? 'premium' :
		selectedProtectionId === worstProtection?.id ? 'minimal' : 'medium'
	);

	onMount(() => {
		// Pre-select the best (recommended) protection, unless one is already selected
		if (bestProtection) {
			selectedProtectionId = bestProtection.id;
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

			// Navigate to next step (addons)
			goto(`/kiosk/${encodeURIComponent(data.bookingId)}/addons`);
		} catch (err) {
			console.error('Error confirming protection:', err);
			alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Main content -->
<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-6">
	<div class="mb-12 flex items-start justify-between gap-8">
		<div class="flex-grow">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Choose Your Protection</h1>
			<p class="text-lg text-gray-600">
				We recommend our premium protection for complete peace of mind
			</p>
		</div>
	</div>

	<!-- Recommended protection (large card) - packages with 3+ stars or isNudge -->
	{#each data.packages.filter((pkg) => pkg.ratingStars > 2 || pkg.isNudge) as pkg (pkg.id)}
		{@const isSelected = selectedProtectionId === pkg.id}

		<div class="mb-12 flex justify-center">
			<button
				onclick={() => (selectedProtectionId = pkg.id)}
				class="w-full max-w-3xl bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden relative {isSelected
					? 'ring-4 ring-sixt-orange'
					: 'border-2 border-gray-200'}"
			>
				<!-- Recommended badge (top left of card) -->
				<div
					class="absolute top-2 left-2 bg-sixt-orange text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10"
				>
					⭐ Recommended Protection
				</div>

				<!-- Content -->
				<div class="p-8 text-left">
					<!-- Header with name and rating -->
					<div class="flex justify-between items-start mb-4">
						<div class="flex-grow">
							<h3 class="text-3xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
							{#if pkg.ratingStars > 0}
								<div class="text-base text-gray-600">{getStarRating(pkg.ratingStars)}</div>
							{/if}
						</div>
						<div class="text-right ml-6">
							{#if pkg.price.discountPercentage > 0 && pkg.price.listPrice}
								<div class="text-sm text-gray-500 line-through mb-1">
									{formatPrice(pkg.price.listPrice.amount)}
									{pkg.price.listPrice.suffix}
								</div>
							{/if}
							<div class="font-bold text-2xl text-sixt-orange mb-1">
								<span>{formatPrice(pkg.price.displayPrice.amount)}</span>
								<span class="text-base font-normal">{pkg.price.displayPrice.suffix}</span>
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
						<p class="text-base text-gray-600 mb-4">{pkg.description}</p>
					{/if}

					<!-- Includes section -->
					{#if pkg.includes.length > 0}
						<div class="mb-4">
							<h4 class="text-lg font-semibold text-gray-900 mb-3">What's Included:</h4>
							<div class="space-y-2.5">
								{#each pkg.includes as coverage}
									<div class="flex items-start gap-3">
										<svg
											class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fill-rule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clip-rule="evenodd"
											/>
										</svg>
										<div class="flex-grow">
											<p class="text-sm text-green-700 font-medium">{coverage.title}</p>
											{#if coverage.description}
												<p class="text-xs text-gray-600 mt-0.5">{coverage.description}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Selection indicator -->
					<div
						class="ml-3 w-10 h-10 flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4"
					>
						{#if isSelected}
							<div
								class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center"
							>
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}
					</div>
				</div>
			</button>
		</div>
	{/each}

	<!-- Basic protection (small card) - packages with 0-2 stars -->
	{#each data.packages.filter((pkg) => pkg.ratingStars <= 2) as pkg (pkg.id)}
		{@const isSelected = selectedProtectionId === pkg.id}

		<div class="mb-8 flex justify-center">
			<button
				onclick={() => (selectedProtectionId = pkg.id)}
				class="w-full max-w-3xl bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-5 text-left relative {isSelected
					? 'ring-2 ring-sixt-orange'
					: 'border border-gray-200'}"
			>
				<!-- Header -->
				<div class="flex justify-between items-start mb-3">
					<div class="flex-grow">
						<div class="flex items-center gap-2 mb-1">
							<h3 class="text-lg font-bold text-gray-900">{pkg.name}</h3>
							{#if pkg.ratingStars > 0}
								<span class="text-sm text-gray-600">{getStarRating(pkg.ratingStars)}</span>
							{/if}
						</div>
						{#if pkg.description}
							<p class="text-xs text-gray-600 mb-2">{pkg.description}</p>
						{/if}
					</div>
					<div class="text-right ml-4 flex-shrink-0">
						{#if pkg.price.discountPercentage > 0 && pkg.price.listPrice}
							<div class="text-xs text-gray-500 line-through">
								{formatPrice(pkg.price.listPrice.amount)}
							</div>
						{/if}
						<div class="font-bold text-base text-sixt-orange">
							{formatPrice(pkg.price.displayPrice.amount)}
							<span class="text-xs">{pkg.price.displayPrice.suffix}</span>
						</div>
					</div>
				</div>

				<!-- Warning for 0-star protection -->
				{#if pkg.ratingStars === 0}
					<div class="mb-3 p-2 bg-red-50 border border-red-200 rounded">
						<p class="text-xs font-semibold text-red-600">
							⚠️ This package does NOT offer any protection coverage
						</p>
					</div>
				{/if}

				<!-- Includes section (compact) -->
				{#if pkg.includes.length > 0}
					<div class="mb-3">
						<h4 class="text-xs font-semibold text-gray-900 mb-2">Includes:</h4>
						<div class="space-y-1">
							{#each pkg.includes as coverage}
								<div class="flex items-start gap-2">
									<span class="text-green-600 text-xs mt-0.5">✓</span>
									<p class="text-xs text-gray-700">{coverage.title}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Excludes section (compact) -->
				{#if pkg.excludes.length > 0}
					<div class="pt-2 border-t border-gray-200">
						<h4 class="text-xs font-semibold text-red-700 mb-1">Does not include:</h4>
						<div class="space-y-0.5">
							{#each pkg.excludes as coverage}
								<div class="flex items-start gap-2">
									<span class="text-red-600 text-xs font-bold">✗</span>
									<p class="text-xs text-red-700 font-medium">{coverage.title}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Selection indicator -->
				{#if isSelected}
					<div
						class="ml-3 w-10 h-10 flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4"
					>
						<div
							class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center"
						>
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>
				{/if}
			</button>
		</div>
	{/each}

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

<!-- Avatar positioned at bottom right -->
<div class="fixed bottom-8 right-8 scale-150">
	<SpeakingAvatar
		text="Choose the protection package that best suits your needs. We recommend our premium protection for complete peace of mind during your journey."
		variant={avatarVariant}
		useElevenLabs={true}
		autoSpeak={true}
	/>
</div>
