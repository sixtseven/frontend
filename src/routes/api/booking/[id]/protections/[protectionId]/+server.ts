import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
    const { id, protectionId } = params;

    try {
        // Proxy POST request to external API
        const response = await fetch(
            `https://hackatum25.sixt.io/api/booking/${encodeURIComponent(id)}/protections/${encodeURIComponent(protectionId)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return json(
                { error: `API error: ${response.statusText}` },
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
