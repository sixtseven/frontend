<script lang="ts">
	import sixtIcon from '$lib/assets/sixt7.png';
	import mascot from '$lib/assets/sixtseven.png';
</script>

<div class="flex-grow bg-white font-sixt flex flex-col items-center justify-start">
	<div class="w-full flex-grow"></div>
	<!-- Mascot -->
	<div class="mt-6 flex items-center justify-center">
		<img src={mascot} alt="SixtSeven mascot" class="w-56 h-auto object-contain" />
	</div>

	<!-- Top logos -->
	<div class="w-full max-w-4xl flex items-center justify-center md:gap-20 gap-5 px-6 py-6">
		<img src="/hackatum.png" alt="Hackatum" class=" h-20 w-auto object-contain" />
		<div class="text-gray-400 text-4xl">//</div>
		<img src={sixtIcon} alt="SIXT" class=" h-10 w-auto object-contain" />
	</div>

	<!-- Short description -->
	<main class="flex-grow w-full max-w-3xl px-6 text-center mb-6">
		<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mt-8">SixtSeven - Hackatum Project</h1>
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

	<div class="w-full flex-grow"></div>
</div>
