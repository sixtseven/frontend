<script lang="ts">
	import { onMount } from 'svelte';
	import type { AddonGroup, AddonOption } from './+page.server';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';

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

			// Navigate to next step (rent or completed)
			window.location.href = `/kiosk/${encodeURIComponent(data.bookingId)}`;
		} catch (err) {
			console.error('Error confirming addons:', err);
			alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Main content -->
<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">Available Add-ons</h1>
		<p class="text-lg text-gray-600">Enhance your rental with optional add-ons</p>
	</div>

	<!-- Addon groups -->
	<div class="space-y-8 mb-12">
		{#each data.addonGroups as group (group.id)}
			<div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
				<!-- Group title -->
				{#if group.name}
					<h2 class="text-2xl font-bold text-gray-900 mb-6">{group.name}</h2>
				{/if}

				<!-- Addon options -->
				<div class="space-y-4">
					{#each group.options as option (option.chargeDetail.id)}
						{@const quantity = selections[option.chargeDetail.id] || 0}
						{@const canAdd = quantity < option.additionalInfo.selectionStrategy.maxSelectionLimit}
						{@const isMulti = option.additionalInfo.selectionStrategy.isMultiSelectionAllowed}
						<div
							class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
						>
							<!-- Header with icon, title, and price -->
							<div class="flex gap-4 mb-3">
								<img
									src={option.chargeDetail.iconUrl}
									alt={option.chargeDetail.title}
									class="w-12 h-12 object-contain flex-shrink-0"
								/>
								<div class="flex-grow">
									<h3 class="text-lg font-semibold text-gray-900">{option.chargeDetail.title}</h3>
									<p class="text-sm text-gray-600 mt-1">{option.chargeDetail.description}</p>
								</div>
								<div class="text-right flex-shrink-0">
									<div class="font-bold text-lg text-sixt-orange">
										{formatPrice(option.additionalInfo.price.displayPrice.amount)}
										<span class="text-sm">{option.additionalInfo.price.displayPrice.suffix}</span>
									</div>
								</div>
							</div>

							<!-- Quantity selector (if multi-selection allowed) -->
							{#if isMulti}
								<div class="flex items-center gap-3 mt-4">
									<button
										onclick={() => decrementQuantity(option.chargeDetail.id, option)}
										disabled={quantity === 0}
										class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded text-gray-900 font-bold transition"
									>
										−
									</button>
									<span class="text-lg font-semibold text-gray-900 w-8 text-center">{quantity}</span
									>
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
								<!-- Single selection toggle -->
								<div class="flex items-center gap-3 mt-4">
									<button
										onclick={() => {
											selections[option.chargeDetail.id] = quantity > 0 ? 0 : 1;
										}}
										class="flex items-center gap-2 px-4 py-2 rounded transition {quantity > 0
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
						</div>
					{/each}
				</div>
			</div>
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
