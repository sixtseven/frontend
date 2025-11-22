import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ params }: RequestEvent) {
	const bookingId = params.id;

	try {
		const response = await fetch(
			`https://hackatum25.sixt.io/api/booking/${bookingId}/complete`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('API Error:', errorText);
			return json({ error: 'Failed to complete booking' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Error completing booking:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
