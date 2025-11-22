<script lang="ts">
	let { children } = $props();
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

	<!-- Page content -->
	{@render children()}

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
		<div class="max-w-7xl mx-auto text-center text-sm">
			<p class="uppercase tracking-widest">
				&copy; 2025 SIXT. All rights reserved. | Automated Key Vending System
			</p>
		</div>
	</footer>
</div>
