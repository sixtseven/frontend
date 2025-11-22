import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export interface ProtectionCoverage {
    description: string;
    id: string;
    tags: string[];
    title: string;
}

export interface ProtectionPrice {
    discountPercentage: number;
    displayPrice: {
        amount: number;
        currency: string;
        suffix: string;
    };
    listPrice?: {
        amount: number;
        currency: string;
        suffix: string;
    };
    totalPrice: {
        amount: number;
        currency: string;
        suffix: string;
    };
}

export interface ProtectionPackage {
    deductibleAmount: {
        currency: string;
        value: number;
    };
    description?: string;
    excludes: ProtectionCoverage[];
    id: string;
    includes: ProtectionCoverage[];
    isDeductibleAvailable: boolean;
    isNudge: boolean;
    isPreviouslySelected: boolean;
    isSelected: boolean;
    name: string;
    price: ProtectionPrice;
    ratingStars: number;
}

export interface ProtectionsResponse {
    protectionPackages: ProtectionPackage[];
}

export async function load({ params }: RequestEvent) {
    const bookingId = params.id as string;

    try {
        const response = await fetch(
            `https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}/protections`
        );

        if (!response.ok) {
            throw error(response.status, `Failed to fetch protections: ${response.statusText}`);
        }

        const data: ProtectionsResponse = await response.json();

        return {
            bookingId,
            packages: data.protectionPackages
        };
    } catch (err) {
        if (err instanceof Object && 'status' in err) {
            throw err;
        }

        throw error(500, `Failed to load protections: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};
