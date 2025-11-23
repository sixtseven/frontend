import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
    try {
        // Proxy POST request to backend
        const response = await fetch('http://127.0.0.1:9000/trigger-broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return json(
                { error: `Backend error: ${response.statusText}` },
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
};
