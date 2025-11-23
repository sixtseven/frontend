import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

let ELEVENLABS_API_KEY: string | undefined;

try {
	const envModule = await import('$env/static/private');
	ELEVENLABS_API_KEY = envModule.ELEVENLABS_API_KEY;
} catch {
	// Environment variable not set
	ELEVENLABS_API_KEY = undefined;
}

const VOICE_ID = '6IwYbsNENZgAB1dtBZDp';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { text } = await request.json();

		if (!text) {
			throw error(400, 'Text is required');
		}

		if (!ELEVENLABS_API_KEY) {
			// Return a signal to use browser TTS instead
			return json({ useBrowserTTS: true });
		}

		// Call ElevenLabs API
		const response = await fetch(
			`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
			{
				method: 'POST',
				headers: {
					'Accept': 'audio/mpeg',
					'Content-Type': 'application/json',
					'xi-api-key': ELEVENLABS_API_KEY
				},
				body: JSON.stringify({
					text,
					model_id: 'eleven_turbo_v2_5', // Updated to free tier compatible model
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75,
						style: 0.0,
						use_speaker_boost: true
					}
				})
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('ElevenLabs API error:', errorText);
			throw error(response.status, `ElevenLabs API error: ${errorText}`);
		}

		// Get audio data as array buffer
		const audioBuffer = await response.arrayBuffer();

		// Return audio as response
		return new Response(audioBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		console.error('TTS API error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to generate speech');
	}
};
