<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let text: string = '';
	export let autoSpeak: boolean = false;
	export let useElevenLabs: boolean = false;
	export let onSpeechEnd: (() => void) | undefined = undefined;
	export let variant: 'premium' | 'medium' | 'minimal' = 'medium';

	// Set image URLs based on variant (reactive)
	$: idleImageUrl = `/avatar-closed-${variant}.png`;
	$: speakingImageUrl = `/avatar-open-${variant}.png`;

	let isSpeaking = false;
	let isLoading = false;
	$: if (!isSpeaking) currentImage = idleImageUrl;
	let currentImage = idleImageUrl;
	let mouthAnimationInterval: number | null = null;
	let audioElement: HTMLAudioElement | null = null;
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let animationFrameId: number | null = null;

	const startMouthAnimation = () => {
		let isOpen = false;
		mouthAnimationInterval = window.setInterval(() => {
			isOpen = !isOpen;
			currentImage = isOpen ? speakingImageUrl : idleImageUrl;
		}, 150);
	};

	const startAudioAnalysis = (audio: HTMLAudioElement) => {
		if (!browser) return;

		// Create audio context and analyser for more accurate mouth sync
		audioContext = new AudioContext();
		const source = audioContext.createMediaElementSource(audio);
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;

		source.connect(analyser);
		analyser.connect(audioContext.destination);

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const animate = () => {
			if (!analyser || !isSpeaking) return;

			analyser.getByteFrequencyData(dataArray);

			// Calculate average volume
			const average = dataArray.reduce((a, b) => a + b) / bufferLength;

			// Open mouth if there's significant audio
			currentImage = average > 30 ? speakingImageUrl : idleImageUrl;

			animationFrameId = requestAnimationFrame(animate);
		};

		animate();
	};

	const stopMouthAnimation = () => {
		if (mouthAnimationInterval) {
			clearInterval(mouthAnimationInterval);
			mouthAnimationInterval = null;
		}
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		currentImage = idleImageUrl;
	};

	export const speak = async (textToSpeak?: string) => {
		if (!browser) return;

		const speechText = textToSpeak || text;

		if (!speechText) {
			console.warn('Text is empty');
			return;
		}

		// Stop any current speech
		stop();

		if (useElevenLabs) {
			await speakWithElevenLabs(speechText);
		} else {
			speakWithBrowserTTS(speechText);
		}
	};

	const speakWithElevenLabs = async (speechText: string) => {
		if (!browser) {
			console.warn('Cannot use ElevenLabs during SSR');
			return;
		}

		try {
			isLoading = true;

			const response = await fetch('/api/tts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: speechText
				})
			});

			if (!response.ok) {
				throw new Error(`TTS API error: ${response.statusText}`);
			}

			// Check if server is telling us to use browser TTS
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				const data = await response.json();
				if (data.useBrowserTTS) {
					console.log('ElevenLabs not configured, falling back to browser TTS');
					isLoading = false;
					speakWithBrowserTTS(speechText);
					return;
				}
			}

			const audioBlob = await response.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			audioElement = new Audio(audioUrl);

			audioElement.onloadeddata = () => {
				isLoading = false;
				isSpeaking = true;
				startAudioAnalysis(audioElement!);
			};

			audioElement.onended = () => {
				isSpeaking = false;
				stopMouthAnimation();
				URL.revokeObjectURL(audioUrl);
				if (onSpeechEnd) onSpeechEnd();
			};

			audioElement.onerror = (e) => {
				console.error('Audio playback error:', e);
				isLoading = false;
				isSpeaking = false;
				stopMouthAnimation();
			};

			await audioElement.play();
		} catch (err) {
			console.error('ElevenLabs TTS error:', err);
			isLoading = false;
			isSpeaking = false;
			stopMouthAnimation();
		}
	};

	const speakWithBrowserTTS = (speechText: string) => {
		if (!window.speechSynthesis) {
			console.warn('Speech Synthesis not supported');
			return;
		}

		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(speechText);

		utterance.onstart = () => {
			isSpeaking = true;
			startMouthAnimation();
		};

		utterance.onend = () => {
			isSpeaking = false;
			stopMouthAnimation();
			if (onSpeechEnd) onSpeechEnd();
		};

		utterance.onerror = (event) => {
			console.error('Speech synthesis error:', event);
			isSpeaking = false;
			stopMouthAnimation();

			// If browser TTS fails due to "not-allowed", silently skip (no callback)
			// This happens when there's no user interaction
			if (event.error === 'not-allowed') {
				console.warn('Browser TTS blocked - requires user interaction. Using silent mode.');
				// Don't call onSpeechEnd to avoid breaking navigation
			}
		};

		try {
			window.speechSynthesis.speak(utterance);
		} catch (err) {
			console.error('Failed to start speech synthesis:', err);
			isSpeaking = false;
			stopMouthAnimation();
		}
	};

	export const stop = () => {
		if (!browser) return;

		if (audioElement) {
			audioElement.pause();
			audioElement.currentTime = 0;
			audioElement = null;
		}

		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}

		if (window.speechSynthesis) {
			window.speechSynthesis.cancel();
		}

		isSpeaking = false;
		isLoading = false;
		stopMouthAnimation();
	};

	onMount(() => {
		if (autoSpeak && text && browser) {
			speak();
		}
	});

	onDestroy(() => {
		if (browser) stop();
	});
</script>

<div class="avatar-container">
	<img src={currentImage} alt="Avatar" class="avatar-image" />
</div>

<style>
	.avatar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar-image {
		width: 200px;
		height: 200px;
		object-fit: contain;
	}
</style>
