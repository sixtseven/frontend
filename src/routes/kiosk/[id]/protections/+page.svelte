<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProtectionPackage } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';
	import { goto } from '$app/navigation';
	import { recommendationsStore } from '$lib/stores';
	import { formatPrice } from '$lib/utils/formatting';

	interface Props {
		data: {
			bookingId: string;
			packages: ProtectionPackage[];
		};
	}

	let { data }: Props = $props();
	let recommendations = $derived($recommendationsStore);

	let selectedProtectionId: string | null = $state(null);
	let isLoading = $state(false);
	let showNoProtectionModal = $state(false);

	// Sort packages by rating (descending), with isNudge taking priority
	// Filter out 0-star packages (no protection) since we have a dedicated "I don't need protection" button
	const sortedPackages = $derived(
		[...data.packages]
			.filter((pkg) => pkg.ratingStars > 0)
			.sort((a, b) => {
				if (a.isNudge && !b.isNudge) return -1;
				if (!a.isNudge && b.isNudge) return 1;
				return b.ratingStars - a.ratingStars;
			})
	);

	// Find the best protection (highest rating)
	const bestProtection = $derived(sortedPackages[0]);

	// Find the second best protection
	const secondBestProtection = $derived(sortedPackages[1] || sortedPackages[0]);

	// Determine which car was chosen and get its is_expensive flag
	const chosenCarIsExpensive = $derived(
		!recommendations ? false :
		recommendations.chosen_car === 'upsell'
			? (recommendations.upsell_car?.is_expensive ?? false)
			: (recommendations.base_car?.is_expensive ?? false)
	);

	// Determine recommended protection (shown as large card) based on is_expensive flag
	const recommendedProtection = $derived(
		chosenCarIsExpensive ? bestProtection : secondBestProtection
	);

	// Get AI recommendation text if available
	const avatarText = $derived(
		recommendations?.insurance_recommendation ||
		"Choose the protection package that best suits your needs. We recommend our premium protection for complete peace of mind during your journey."
	);

	// Find the worst protection (lowest rating stars)
	const worstProtection = $derived(
		sortedPackages[sortedPackages.length - 1]
	);

	// Determine avatar variant based on selected protection
	const avatarVariant = $derived<'premium' | 'medium' | 'minimal'>(
		selectedProtectionId === bestProtection?.id ? 'premium' :
		selectedProtectionId === worstProtection?.id ? 'minimal' : 'medium'
	);

	onMount(() => {
		// Pre-select the recommended protection based on is_expensive flag
		if (recommendedProtection) {
			selectedProtectionId = recommendedProtection.id;
		} else if (data.packages.length > 0) {
			selectedProtectionId = data.packages[0].id;
		}
	});

	function getStarRating(stars: number): string {
		return '⭐'.repeat(Math.max(stars, 0));
	}

	async function handleNoProtection() {
		isLoading = true;
		try {
			// Navigate to next step (addons) without selecting protection
			goto(`/kiosk/${encodeURIComponent(data.bookingId)}/addons`);
		} catch (err) {
			console.error('Error proceeding without protection:', err);
			alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
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

	<!-- Display all packages in order, with recommended shown as large card -->
	{#each sortedPackages as pkg (pkg.id)}
		{@const isSelected = selectedProtectionId === pkg.id}
		{@const isRecommended = pkg.id === recommendedProtection?.id}
		{@const isBestNotRecommended = pkg.id === bestProtection?.id && !isRecommended}

		{#if isRecommended}
			<!-- Large recommended card -->
			<div class="mb-6 flex justify-center">
				<button
					onclick={() => (selectedProtectionId = pkg.id)}
					class="w-full max-w-3xl bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden relative {isSelected
						? 'ring-4 ring-sixt-orange'
						: 'border-2 border-gray-200'}"
				>
					<!-- Recommended badge -->
					<div
						class="absolute top-2 left-2 bg-sixt-orange text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10"
					>
						⭐ Recommended Protection
					</div>

					<div class="px-8 pb-8 pt-12 text-left">
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
										{formatPrice(pkg.price.listPrice.amount, pkg.price.listPrice.currency, pkg.price.listPrice.suffix)}
									</div>
								{/if}
								<div class="font-bold text-2xl text-sixt-orange mb-1">
									{formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency, pkg.price.displayPrice.suffix)}
								</div>
								{#if pkg.price.discountPercentage > 0}
									<div class="text-xs text-green-600 font-semibold">
										{pkg.price.discountPercentage}% off
									</div>
								{/if}
							</div>
						</div>

						{#if pkg.description}
							<p class="text-base text-gray-600 mb-4">{pkg.description}</p>
						{/if}

						{#if pkg.includes.length > 0}
							<div class="mb-4">
								<h4 class="text-lg font-semibold text-gray-900 mb-3">What's Included:</h4>
								<div class="space-y-2.5">
									{#each pkg.includes as coverage}
										<div class="flex items-start gap-3">
											<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
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

						{#if pkg.excludes.length > 0}
							<div class="pt-3 border-t border-gray-200">
								<h4 class="text-base font-semibold text-red-700 mb-2">Does not include:</h4>
								<div class="space-y-1.5">
									{#each pkg.excludes as coverage}
										<div class="flex items-start gap-2">
											<span class="text-red-600 text-sm font-bold">✗</span>
											<p class="text-sm text-red-700 font-medium">{coverage.title}</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<div class="ml-3 w-10 h-10 flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4">
							{#if isSelected}
								<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
						</div>
					</div>
				</button>
			</div>
		{:else}
			<!-- Small card -->
			<div class="mb-6 flex justify-center">
				<button
					onclick={() => (selectedProtectionId = pkg.id)}
					class="w-full max-w-3xl bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-5 text-left relative {isSelected
						? 'ring-2 ring-sixt-orange'
						: 'border border-gray-200'}"
				>
					<!-- Best Protection badge (when best but not recommended) -->
					{#if isBestNotRecommended}
						<div
							class="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md z-10"
						>
							👑 Best Coverage
						</div>
					{/if}

					<div class="flex justify-between items-start mb-3 {isBestNotRecommended ? 'mt-8' : ''}">
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
									{formatPrice(pkg.price.listPrice.amount, pkg.price.listPrice.currency, pkg.price.listPrice.suffix)}
								</div>
							{/if}
							<div class="font-bold text-base text-sixt-orange">
								{formatPrice(pkg.price.displayPrice.amount, pkg.price.displayPrice.currency, pkg.price.displayPrice.suffix)}
							</div>
						</div>
					</div>

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

					{#if isSelected}
						<div class="ml-3 w-10 h-10 flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4">
							<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							</div>
						</div>
					{/if}
				</button>
			</div>
		{/if}
	{/each}

	<!-- Confirm button -->
	<div class="flex flex-col items-center gap-4">
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

		<!-- Skip protection button -->
		<button
			onclick={() => showNoProtectionModal = true}
			disabled={isLoading}
			class="text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
		>
			I don't need protection
		</button>
	</div>
</main>

<!-- No Protection Confirmation Modal -->
{#if showNoProtectionModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
			<!-- Close button -->
			<button
				onclick={() => showNoProtectionModal = false}
				class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
				disabled={isLoading}
			>
				×
			</button>

			<!-- Warning Icon -->
			<div class="flex justify-center mb-6">
				<div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
					<svg class="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				</div>
			</div>

			<!-- Title -->
			<h2 class="text-3xl font-bold text-gray-900 text-center mb-4">
				Are you sure?
			</h2>

			<!-- Warning message -->
			<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
				<p class="text-base text-red-800 font-semibold mb-2">
					⚠️ Proceeding without protection means:
				</p>
				<ul class="text-sm text-red-700 space-y-1 ml-4">
					<li>• You are fully liable for any damage to the vehicle</li>
					<li>• You may be responsible for high repair costs</li>
					<li>• No coverage for theft, windshield damage, or tire damage</li>
					<li>• You could face unexpected expenses during your rental</li>
				</ul>
			</div>

			<!-- Recommendation -->
			<p class="text-center text-gray-700 mb-8 text-lg">
				We <strong>strongly recommend</strong> choosing at least basic protection to avoid financial risk during your trip.
			</p>

			<!-- Action buttons -->
			<div class="flex gap-4">
				<button
					onclick={() => showNoProtectionModal = false}
					disabled={isLoading}
					class="flex-1 px-6 py-4 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
				>
					Go Back & Choose Protection
				</button>
				<button
					onclick={handleNoProtection}
					disabled={isLoading}
					class="flex-1 px-6 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg shadow transition disabled:opacity-50"
				>
					{isLoading ? 'Processing...' : 'Continue Without Protection'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Avatar positioned at bottom right -->
<div class="fixed bottom-8 right-8 scale-150">
	<SpeakingAvatar
		text={avatarText}
		variant={avatarVariant}
		useElevenLabs={true}
		autoSpeak={true}
	/>
</div>
