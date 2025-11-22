<script lang="ts">
	import sixtIcon from '$lib/assets/sixt.svg';
</script>

<div class="min-h-screen bg-white font-sixt flex flex-col items-center justify-start">
	<!-- Top logos -->
	<div class="w-full max-w-4xl flex items-center justify-center gap-20 px-6 py-6">
		<img src="/hackatum.png" alt="Hackatum" class=" h-40 w-auto object-contain" />
		<div class="text-gray-400 text-8xl">//</div>
		<img src={sixtIcon} alt="SIXT" class=" h-32 w-auto object-contain" />
	</div>

	<!-- Short description -->
	<main class="flex-grow w-full max-w-3xl px-6 text-center">
		<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mt-8">SixtSeven — Hackatum Project</h1>
		<p class="text-gray-600 mt-4">
			This is a Hackatum project. View the submission on
			<a
				class="text-sixt-orange font-semibold underline ml-1"
				href="https://devpost.com/software/sixtseven-w6gubf"
				target="_blank"
				rel="noopener noreferrer">Devpost</a
			>.
		</p>

		<!-- Action buttons -->
		<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
			<a
				href="/booking"
				class="px-8 py-3 bg-sixt-orange text-white font-bold rounded shadow hover:bg-orange-700 transition"
				>Tester UI (/booking)</a
			>
			<a
				href="/kiosk"
				class="px-8 py-3 bg-gray-800 text-white font-bold rounded shadow hover:bg-gray-700 transition"
				>Kiosk UI (/kiosk)</a
			>
		</div>
	</main>

	<footer class="w-full max-w-3xl px-6 py-8 text-center text-sm text-gray-500">
		&copy; 2025 SixtSeven — Hackatum X 2025 | Automated Key Vending System
	</footer>
</div>
