<script lang="ts">
	import { onMount } from 'svelte';
	import type { AddonGroup, AddonOption } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: {
			bookingId: string;
			addonGroups: AddonGroup[];
		};
	}

	let { data }: Props = $props();

	// Track quantities for each addon option by ID
	let selections: Record<string, number> = $state({});
	let isLoading = $state(false);

	// Determine avatar variant based on whether any addons are selected
	const avatarVariant = $derived<'premium' | 'minimal'>(
		Object.values(selections).some((qty) => qty > 0) ? 'premium' : 'minimal'
	);

	// Determine if an addon is "premium" (recommended/nudged)
	function isPremiumAddon(option: AddonOption): boolean {
		// You can customize this logic based on your business rules
		// For now, we'll consider addons with isNudge flag or high importance as premium
		return option.additionalInfo.isNudge || false;
	}

	// Check if an addon is a child seat option
	function isChildSeat(option: AddonOption): boolean {
		const title = option.chargeDetail.title.toLowerCase();
		const tags = option.chargeDetail.tags.map((t) => t.toLowerCase());
		return (
			title.includes('child') ||
			title.includes('seat') ||
			tags.some((tag) => tag.includes('child') || tag.includes('seat'))
		);
	}

	// Group child seats together
	function getChildSeatOptions(group: AddonGroup): AddonOption[] {
		return group.options.filter((opt) => isChildSeat(opt));
	}

	// Get non-child-seat options
	function getNonChildSeatOptions(group: AddonGroup): AddonOption[] {
		return group.options.filter((opt) => !isChildSeat(opt));
	}

	onMount(() => {
		// Initialize quantities based on currentSelection from API
		data.addonGroups.forEach((group) => {
			group.options.forEach((option) => {
				const key = option.chargeDetail.id;
				selections[key] = option.additionalInfo.selectionStrategy.currentSelection;
			});
		});
	});

	function formatPrice(amount: number): string {
		return (amount / 100).toFixed(2);
	}

	function incrementQuantity(addonId: string, option: AddonOption) {
		const current = selections[addonId] || 0;
		const max = option.additionalInfo.selectionStrategy.maxSelectionLimit;
		if (current < max) {
			selections[addonId] = current + 1;
		}
	}

	function decrementQuantity(addonId: string, option: AddonOption) {
		const current = selections[addonId] || 0;
		if (current > 0) {
			selections[addonId] = current - 1;
		}
	}

	async function handleConfirm() {
		isLoading = true;

		try {
			// POST each addon with its selected quantity
			const promises = Object.entries(selections)
				.filter(([, quantity]) => quantity > 0)
				.map(([addonId, quantity]) =>
					fetch(
						`/api/booking/${encodeURIComponent(data.bookingId)}/addons/${encodeURIComponent(addonId)}/amount/${quantity}`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							}
						}
					)
				);

			const results = await Promise.all(promises);

			// Check if all requests succeeded
			const allSuccess = results.every((res) => res.ok);
			if (!allSuccess) {
				throw new Error('One or more addon selections failed');
			}

			// Complete the booking
			const completeResponse = await fetch(
				`/api/booking/${encodeURIComponent(data.bookingId)}/complete`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (!completeResponse.ok) {
				throw new Error('Failed to complete booking');
			}

			// Navigate to summary page
			goto(`/kiosk/${encodeURIComponent(data.bookingId)}/summary`);
		} catch (err) {
			console.error('Error confirming addons:', err);
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
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Available Add-ons</h1>
			<p class="text-lg text-gray-600">Enhance your rental with optional add-ons</p>
		</div>
	</div>

	<!-- Addon groups -->
	<div class="space-y-8 mb-12">
		{#each data.addonGroups as group (group.id)}
			<!-- Child Seats Combined Card -->
			{@const childSeats = getChildSeatOptions(group)}
			{#if childSeats.length > 0}
				{@const hasSelection = childSeats.some((opt) => (selections[opt.chargeDetail.id] || 0) > 0)}

				<div class="mb-6 flex justify-center">
					<div
						class="w-full max-w-2xl bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-5 relative {hasSelection
							? 'ring-2 ring-sixt-orange'
							: 'border border-gray-200'}"
					>
						<h3 class="text-lg font-bold text-gray-900 mb-4">Child Seat Options</h3>

						<!-- Child seat options -->
						<div class="space-y-4">
							{#each childSeats as option (option.chargeDetail.id)}
								{@const quantity = selections[option.chargeDetail.id] || 0}
								{@const canAdd =
									quantity < option.additionalInfo.selectionStrategy.maxSelectionLimit}
								{@const isMulti = option.additionalInfo.selectionStrategy.isMultiSelectionAllowed}

								<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
									<img
										src={option.chargeDetail.iconUrl}
										alt={option.chargeDetail.title}
										class="w-12 h-12 object-contain flex-shrink-0"
									/>
									<div class="flex-grow">
										<h4 class="text-sm font-bold text-gray-900">{option.chargeDetail.title}</h4>
										<p class="text-xs text-gray-600 mt-0.5">{option.chargeDetail.description}</p>
									</div>
									<div class="text-right flex-shrink-0 mr-3">
										<div class="font-bold text-sm text-sixt-orange">
											{formatPrice(option.additionalInfo.price.displayPrice.amount)}
											<span class="text-xs">{option.additionalInfo.price.displayPrice.suffix}</span>
										</div>
									</div>

									<!-- Quantity selector -->
									<div class="flex items-center gap-2">
										<button
											onclick={() => decrementQuantity(option.chargeDetail.id, option)}
											disabled={quantity === 0}
											class="w-8 h-8 bg-white hover:bg-gray-100 disabled:opacity-50 rounded text-gray-900 font-bold transition border border-gray-300"
										>
											−
										</button>
										<span class="text-lg font-semibold text-gray-900 w-8 text-center"
											>{quantity}</span
										>
										<button
											onclick={() => incrementQuantity(option.chargeDetail.id, option)}
											disabled={!canAdd}
											class="w-8 h-8 bg-sixt-orange hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded transition"
										>
											+
										</button>
									</div>
								</div>
							{/each}
						</div>

						<!-- Selection indicator tick -->
						<div
							class="ml-3 w-10 h-10 flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4"
						>
							{#if hasSelection}
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
				</div>
			{/if}

			<!-- Premium addons (large cards) - excluding child seats -->
			{#each getNonChildSeatOptions(group).filter( (opt) => isPremiumAddon(opt) ) as option (option.chargeDetail.id)}
				{@const quantity = selections[option.chargeDetail.id] || 0}
				{@const canAdd = quantity < option.additionalInfo.selectionStrategy.maxSelectionLimit}
				{@const isMulti = option.additionalInfo.selectionStrategy.isMultiSelectionAllowed}
				{@const isSelected = quantity > 0}

				<div class="mb-8 flex justify-center">
					<div
						class="w-full max-w-3xl bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden relative {isSelected
							? 'ring-4 ring-sixt-orange'
							: 'border-2 border-gray-200'}"
					>
						<!-- Recommended badge -->
						<div
							class="absolute top-2 left-2 bg-sixt-orange text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10"
						>
							⭐ Recommended Add-on
						</div>

						<div class="p-8">
							<!-- Header -->
							<div class="flex gap-6 mb-4">
								<img
									src={option.chargeDetail.iconUrl}
									alt={option.chargeDetail.title}
									class="w-20 h-20 object-contain flex-shrink-0"
								/>
								<div class="flex-grow">
									<h3 class="text-2xl font-bold text-gray-900 mb-2">{option.chargeDetail.title}</h3>
									<p class="text-base text-gray-600">{option.chargeDetail.description}</p>
								</div>
								<div class="text-right flex-shrink-0">
									<div class="font-bold text-2xl text-sixt-orange mb-1">
										<span>{formatPrice(option.additionalInfo.price.displayPrice.amount)}</span>
										<span class="text-base font-normal"
											>{option.additionalInfo.price.displayPrice.suffix}</span
										>
									</div>
								</div>
							</div>

							<!-- Quantity selector -->
							{#if isMulti}
								<div class="flex items-center gap-4 mt-6">
									<button
										onclick={() => decrementQuantity(option.chargeDetail.id, option)}
										disabled={quantity === 0}
										class="w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg text-gray-900 font-bold text-xl transition"
									>
										−
									</button>
									<span class="text-2xl font-semibold text-gray-900 w-12 text-center"
										>{quantity}</span
									>
									<button
										onclick={() => incrementQuantity(option.chargeDetail.id, option)}
										disabled={!canAdd}
										class="w-10 h-10 bg-sixt-orange hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-lg text-xl transition"
									>
										+
									</button>
									<span class="text-sm text-gray-600 ml-2">
										(max {option.additionalInfo.selectionStrategy.maxSelectionLimit})
									</span>
								</div>
							{:else}
								<div class="flex items-center gap-4 mt-6">
									<button
										onclick={() => {
											selections[option.chargeDetail.id] = quantity > 0 ? 0 : 1;
										}}
										class="flex items-center gap-2 px-6 py-3 rounded-lg transition text-base font-semibold {quantity >
										0
											? 'bg-sixt-orange text-white'
											: 'bg-gray-200 text-gray-900 hover:bg-gray-300'}"
									>
										<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
										{quantity > 0 ? 'Selected' : 'Select'}
									</button>
								</div>
							{/if}

							<!-- Selection indicator tick -->
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
					</div>
				</div>
			{/each}

			<!-- Basic addons (small cards) -->
			{#each getNonChildSeatOptions(group).filter((opt) => !isPremiumAddon(opt)) as option (option.chargeDetail.id)}
				{@const quantity = selections[option.chargeDetail.id] || 0}
				{@const canAdd = quantity < option.additionalInfo.selectionStrategy.maxSelectionLimit}
				{@const isMulti = option.additionalInfo.selectionStrategy.isMultiSelectionAllowed}
				{@const isSelected = quantity > 0}

				<div class="mb-6 flex justify-center">
					<div
						class="w-full max-w-2xl bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-5 relative {isSelected
							? 'ring-2 ring-sixt-orange'
							: 'border border-gray-200'}"
					>
						<!-- Header -->
						<div class="flex gap-4 mb-3">
							<img
								src={option.chargeDetail.iconUrl}
								alt={option.chargeDetail.title}
								class="w-12 h-12 object-contain flex-shrink-0"
							/>
							<div class="flex-grow">
								<h3 class="text-lg font-bold text-gray-900">{option.chargeDetail.title}</h3>
								<p class="text-sm text-gray-600 mt-1">{option.chargeDetail.description}</p>
							</div>
							<div class="text-right flex-shrink-0">
								<div class="font-bold text-base text-sixt-orange">
									{formatPrice(option.additionalInfo.price.displayPrice.amount)}
									<span class="text-xs">{option.additionalInfo.price.displayPrice.suffix}</span>
								</div>
							</div>
						</div>

						<!-- Quantity selector -->
						{#if isMulti}
							<div class="flex items-center gap-3 mt-4">
								<button
									onclick={() => decrementQuantity(option.chargeDetail.id, option)}
									disabled={quantity === 0}
									class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-gray-900 font-bold transition"
								>
									−
								</button>
								<span class="text-lg font-semibold text-gray-900 w-8 text-center">{quantity}</span>
								<button
									onclick={() => incrementQuantity(option.chargeDetail.id, option)}
									disabled={!canAdd}
									class="w-8 h-8 bg-sixt-orange hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded transition"
								>
									+
								</button>
								<span class="text-xs text-gray-600 ml-2">
									(max {option.additionalInfo.selectionStrategy.maxSelectionLimit})
								</span>
							</div>
						{:else}
							<div class="flex items-center gap-3 mt-4">
								<button
									onclick={() => {
										selections[option.chargeDetail.id] = quantity > 0 ? 0 : 1;
									}}
									class="flex items-center gap-2 px-4 py-2 rounded transition text-sm font-semibold {quantity >
									0
										? 'bg-sixt-orange text-white'
										: 'bg-gray-200 text-gray-900 hover:bg-gray-300'}"
								>
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
									{quantity > 0 ? 'Selected' : 'Select'}
								</button>
							</div>
						{/if}

						<!-- Selection indicator tick -->
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
				</div>
			{/each}
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
			disabled={isLoading}
			class="px-12 py-3 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? 'Confirming...' : 'Continue'}
		</button>
	</div>
</main>

<!-- Avatar positioned at bottom right -->
<div class="fixed bottom-8 right-8 scale-150">
	<SpeakingAvatar
		text="Enhance your rental experience with our premium add-ons! Select any items you'd like to add to make your journey even more comfortable and convenient."
		variant={avatarVariant}
		useElevenLabs={true}
		autoSpeak={true}
	/>
</div>
