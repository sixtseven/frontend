<script lang="ts">
	import { onMount } from 'svelte';
	import sixtIconWhite from '$lib/assets/sixt7-white.png';
	import mascot from '$lib/assets/sixtseven.png';
	import SpeakingAvatar from '$lib/components/SpeakingAvatar.svelte';
	import { page } from '$app/stores';

	let code: string = '';
	let inputEl: HTMLInputElement | null = null;
	let message: string | null = null;

	onMount(() => {
		// Try to focus the hidden/visible input so a USB scanner will type into it
		inputEl?.focus();
	});

	function handleSubmit(e?: Event) {
		e?.preventDefault();

		let val = code?.trim();
		if (!val) {
			message = 'No code detected. Please scan your booking QR code.';
			// re-focus so scanner input goes to the field
			inputEl?.focus();
			return;
		}

		// Check if the code is the full url
		if (val.includes('/booking/')) val = val.split('/booking/')[1];

		// Navigate to the booking page for the scanned ID
		// encodeURIComponent to be safe for any scanner output
		window.location.href = `/kiosk/${encodeURIComponent(val)}`;
	}
</script>

<section
	class="flex-grow flex items-center justify-center py-12 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white"
>
	<div class="max-w-3xl w-full text-center text-white flex flex-col items-center">
		<img src={sixtIconWhite} alt="SIXT" class="h-10 mb-8 w-auto" />

		<div class="mb-8">
			<SpeakingAvatar
				text="Welcome to Sixt! Please scan your booking QR code to get started."
				variant="medium"
				useElevenLabs={true}
				autoSpeak={true}
			/>
		</div>

		<h1 class="text-4xl md:text-5xl font-bold mb-4">Scan your booking QR code</h1>
		<p class="text-lg text-gray-300 mb-8">
			Use the on-screen field below. A USB scanner will input the booking ID automatically.
		</p>

		{#if $page.url.searchParams.has('error')}
			<div
				role="alert"
				class="w-full max-w-3xl mb-6 p-4 rounded-md bg-red-600 text-white flex items-start gap-4 shadow"
			>
				<!-- Icon -->
				<svg
					class="w-6 h-6 flex-shrink-0"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
					/>
				</svg>

				<div class="flex-1 text-left">
					<div class="font-semibold">Error</div>
					<div class="text-sm mt-1">
						{$page.url.searchParams.get('error') ?? 'An unknown error occurred.'}
						{#if $page.url.searchParams.get('error_description')}
							<span class="block text-gray-100/90 mt-1"
								>{$page.url.searchParams.get('error_description')}</span
							>
						{/if}
					</div>
				</div>

				<button
					type="button"
					aria-label="Dismiss error"
					class="ml-4 px-2 py-1 rounded bg-red-700/80 hover:bg-red-700"
					on:click={() => {
						const u = new URL(window.location.href);
						u.searchParams.delete('error');
						u.searchParams.delete('error_description');
						history.replaceState({}, '', u.toString());
						message = null;
						inputEl?.focus();
					}}
				>
					<span class="sr-only">Dismiss</span>
					<!-- simple X -->
					<svg
						class="w-4 h-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/if}

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
