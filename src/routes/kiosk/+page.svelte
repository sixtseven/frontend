<script lang="ts">
	import { onMount } from 'svelte';
	import SixtIcon from '$lib/assets/SixtIcon.svelte';

	let code: string = '';
	let inputEl: HTMLInputElement | null = null;
	let message: string | null = null;

	onMount(() => {
		// Try to focus the hidden/visible input so a USB scanner will type into it
		inputEl?.focus();
	});

	function handleSubmit(e?: Event) {
		e?.preventDefault();

		const val = code?.trim();
		if (!val) {
			message = 'No code detected. Please scan your booking QR code.';
			// re-focus so scanner input goes to the field
			inputEl?.focus();
			return;
		}

		// Navigate to the booking page for the scanned ID
		// encodeURIComponent to be safe for any scanner output
		window.location.href = `/kiosk/${encodeURIComponent(val)}`;
	}
</script>

<section
	class="flex-grow flex items-center justify-center py-12 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white"
>
	<div class="max-w-3xl w-full text-center text-white flex flex-col items-center">
		<SixtIcon class="h-20 mb-8" />

		<h1 class="text-4xl md:text-5xl font-bold mb-4">Scan your booking QR code</h1>
		<p class="text-lg text-gray-300 mb-8">
			Use the on-screen field below. A USB scanner will input the booking ID automatically.
		</p>

		<form on:submit|preventDefault={handleSubmit} class="flex flex-col items-center gap-4">
			<input
				bind:this={inputEl}
				bind:value={code}
				on:input={() => (message = null)}
				type="text"
				inputmode="text"
				autocomplete="off"
				placeholder="Scan booking code here"
				class="w-full md:w-96 lg:w-[40rem] px-6 py-5 text-2xl text-center rounded-lg shadow-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-sixt-orange/30"
			/>

			<div class="flex gap-4">
				<button
					type="submit"
					class="px-8 py-3 bg-sixt-orange hover:bg-orange-700 text-white font-bold rounded shadow transition transform hover:scale-105"
				>
					Open Booking
				</button>

				<button
					type="button"
					class="px-6 py-3 bg-gray-700 text-white rounded shadow"
					on:click={() => {
						code = '';
						message = null;
						inputEl?.focus();
					}}
				>
					Clear
				</button>
			</div>

			{#if message}
				<div class="mt-4 text-sm text-red-300">{message}</div>
			{/if}
		</form>
	</div>
</section>
