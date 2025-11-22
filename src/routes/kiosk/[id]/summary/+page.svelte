<script lang="ts">
	import SixtIcon from '$lib/assets/SixtIcon.svelte';

	interface Props {
		data: {
			bookingId: string;
			booking: any;
		};
	}

	let { data }: Props = $props();

	function formatPrice(amount: number, currency: string = 'EUR'): string {
		return `${currency === 'EUR' ? '€' : '$'}${(amount / 100).toFixed(2)}`;
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Get main vehicle image
	function getMainImage(images: string[] | undefined): string {
		return images && images.length > 0 ? images[0] : '';
	}

	// Calculate total cost
	const totalCost = $derived(() => {
		let total = 0;
		let currency = 'EUR';
		
		// Add vehicle cost
		if (data.booking.selectedVehicle?.vehicle?.vehicleCost) {
			total += data.booking.selectedVehicle.vehicle.vehicleCost.value;
			currency = data.booking.selectedVehicle.vehicle.vehicleCost.currency;
		}
		
		// Add protection cost
		if (data.booking.protectionPackages?.price?.displayPrice) {
			total += data.booking.protectionPackages.price.displayPrice.amount;
			currency = data.booking.protectionPackages.price.displayPrice.currency;
		}
		
		return { amount: total, currency };
	});
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
	<!-- Main content -->
	<main class="flex-grow max-w-7xl w-full mx-auto px-6 py-12">
		<!-- Success message -->
		<div class="bg-sixt-orange text-white rounded-xl p-8 mb-8 text-center shadow-lg">
			<h2 class="text-3xl font-bold mb-2">All Set!</h2>
			<p class="text-lg mb-2">Your vehicle is ready for pickup</p>
			<p class="text-sm text-orange-100">Reservation ID: <span class="font-mono font-bold">{data.bookingId}</span></p>
		</div>

		<!-- Booking Details -->
		<div class="mb-8">
			<!-- Vehicle Information -->
			{#if data.booking.selectedVehicle?.vehicle}
				{@const vehicle = data.booking.selectedVehicle.vehicle}
				<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">

					<div class="flex gap-6">
						<!-- Vehicle Image (Left) -->
						{#if vehicle.images && vehicle.images.length > 0}
							<div class="w-1/2 flex-shrink-0">
								<img 
									src={getMainImage(vehicle.images)} 
									alt="{vehicle.brand} {vehicle.model}"
									class="w-full h-auto object-contain bg-gray-50 rounded-lg"
								/>
							</div>
						{/if}
						
						<!-- Vehicle Details and Reservation Info (Right) -->
						<div class="flex-grow space-y-6">
							<!-- Vehicle Details -->
							<div>
								<p class="text-xl font-bold text-gray-900">
									{vehicle.brand} {vehicle.model}
								</p>
								{#if vehicle.groupType}
									<p class="text-sm text-gray-600 mb-2">{vehicle.groupType}</p>
								{/if}
								{#if vehicle.attributes && vehicle.attributes.length > 0}
									<div class="flex flex-wrap gap-3">
										{#each vehicle.attributes as attr}
											<div class="flex items-center gap-1 text-xs text-gray-700">
												{#if attr.iconUrl}
													<img src={attr.iconUrl} alt={attr.title} class="w-4 h-4" />
												{/if}
												<span>{attr.value}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Reservation Details -->
							<div class="pt-4 border-t border-gray-200">
								<h4 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
									<span>📅</span> Reservation Details
								</h4>
								<div class="space-y-3">
									{#if data.booking.createdAt}
										<div>
											<p class="text-xs text-gray-600 font-semibold">Created</p>
											<p class="text-sm text-gray-900">{formatDate(data.booking.createdAt)}</p>
										</div>
									{/if}
									<div>
										<p class="text-xs text-gray-600 font-semibold">Status</p>
										<p class="text-sm font-bold text-green-600 uppercase">{data.booking.status}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Protection Package -->
		{#if data.booking.protectionPackages}
			{@const protection = data.booking.protectionPackages}
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
				<h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
					<span>🛡️</span> Protection Package
				</h3>
				<div class="flex justify-between items-start mb-4">
					<div class="flex-grow">
						<div class="flex items-center gap-2 mb-1">
							<p class="text-xl font-bold text-gray-900">{protection.name}</p>
							{#if protection.ratingStars > 0}
								<span class="text-sm text-gray-600">{'⭐'.repeat(protection.ratingStars)}</span>
							{/if}
						</div>
						{#if protection.price}
							<p class="text-lg font-bold text-sixt-orange">
								{formatPrice(protection.price.displayPrice.amount, protection.price.displayPrice.currency)}
								<span class="text-sm font-normal">{protection.price.displayPrice.suffix}</span>
							</p>
						{/if}
					</div>
				</div>
				
				{#if protection.includes && protection.includes.length > 0}
					<div class="mt-4">
						<h4 class="text-sm font-semibold text-gray-900 mb-2">Coverage Includes:</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
							{#each protection.includes as coverage}
								<div class="flex items-start gap-2 text-sm">
									<span class="text-green-600 mt-0.5">✓</span>
									<p class="text-gray-700">{coverage.title.split(' - ')[0]}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Add-ons -->
		{#if data.booking.addonGroups && data.booking.addonGroups.length > 0}
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
				<h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
					<span>➕</span> Add-ons
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each data.booking.addonGroups as group}
						{#each group.options as option}
							{#if data.booking.addons && data.booking.addons[option.chargeDetail.id] && data.booking.addons[option.chargeDetail.id] > 0}
								<div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
									<span class="font-semibold text-gray-900">{option.chargeDetail.title}</span>
									<span class="text-sm text-gray-600">×{data.booking.addons[option.chargeDetail.id]}</span>
								</div>
							{/if}
						{/each}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Total Price -->
		{#if totalCost().amount > 0}
			<div class="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
				<div class="flex justify-between items-center">
					<h3 class="text-2xl font-bold text-gray-900">Total Cost</h3>
					<p class="text-4xl font-bold text-sixt-orange">
						{formatPrice(totalCost().amount, totalCost().currency)}
					</p>
				</div>
			</div>
		{/if}

		<!-- Next Steps -->
		<div class="bg-blue-50 border-2 border-blue-500 rounded-xl p-8">
			<h3 class="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
				<span>🔑</span> How to Get Your Vehicle
			</h3>
			<div class="space-y-6 text-blue-800">
				<div class="flex items-start gap-4">
					<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
					<div>
						<p class="font-bold text-lg mb-1">Retrieve Your Keys</p>
						<p>Use reservation ID <span class="font-mono font-bold bg-blue-100 px-2 py-1 rounded">{data.bookingId}</span> at the key box near the exit.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
					<div>
						<p class="font-bold text-lg mb-1">Locate Your Vehicle</p>
						<p>Head to the designated pickup area. Your vehicle will be ready shortly.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
					<div>
						<p class="font-bold text-lg mb-1">Quick Vehicle Check</p>
						<p>Inspect the exterior and report any existing damage to our staff.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="bg-sixt-orange text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">4</div>
					<div>
						<p class="font-bold text-lg mb-1">Hit the Road!</p>
						<p>You're all set. Enjoy your journey!</p>
					</div>
				</div>
			</div>
			
			<div class="mt-6 p-4 bg-blue-100 rounded-lg">
				<p class="text-sm text-blue-900">
					<strong>📞 Need Assistance?</strong> Contact us at <span class="font-semibold">+1-800-SIXT-RENT</span>
				</p>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex justify-center gap-4 mt-8">
			<button
				onclick={() => window.print()}
				class="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded shadow transition"
			>
				Print Summary
			</button>
			<button
				onclick={() => window.location.href = '/kiosk'}
				class="px-8 py-3 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded shadow transition"
			>
				New Rental
			</button>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-gray-800 text-white py-6 mt-12">
		<div class="max-w-7xl mx-auto px-6 text-center">
			<p class="text-sm text-gray-400">
				Have a safe and enjoyable journey with SIXT!
			</p>
		</div>
	</footer>
</div>
