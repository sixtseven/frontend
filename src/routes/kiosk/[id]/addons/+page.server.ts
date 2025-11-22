import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export interface ChargeDetail {
    description: string;
    iconUrl: string;
    id: string;
    tags: string[];
    title: string;
}

export interface SelectionStrategy {
    currentSelection: number;
    isMultiSelectionAllowed: boolean;
    maxSelectionLimit: number;
}

export interface AdditionalInfo {
    isEnabled: boolean;
    isNudge: boolean;
    isPreviouslySelected: boolean;
    isSelected: boolean;
    price: {
        discountPercentage: number;
        displayPrice: {
            amount: number;
            currency: string;
            suffix: string;
        };
    };
    selectionStrategy: SelectionStrategy;
}

export interface AddonOption {
    additionalInfo: AdditionalInfo;
    chargeDetail: ChargeDetail;
}

export interface AddonGroup {
    id: number;
    name: string;
    options: AddonOption[];
}

export interface AddonsResponse {
    addons: AddonGroup[];
}

export async function load({ params }: RequestEvent) {
    const bookingId = params.id as string;

    try {
        const response = await fetch(
            `https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}/addons`
        );

        if (!response.ok) {
            throw error(response.status, `Failed to fetch addons: ${response.statusText}`);
        }

        const data: AddonsResponse = await response.json();

        return {
            bookingId,
            addonGroups: data.addons
        };
    } catch (err) {
        if (err instanceof Object && 'status' in err) {
            throw err;
        }

        throw error(500, `Failed to load addons: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}
