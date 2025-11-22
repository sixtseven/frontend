import { json } from '@sveltejs/kit';

export async function POST() {
  try {
    const response = await fetch('https://hackatum25.sixt.io/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    return json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
