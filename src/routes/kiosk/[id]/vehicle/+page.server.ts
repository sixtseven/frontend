import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export interface VehicleAttribute {
    attributeType: string;
    iconUrl?: string;
    key: string;
    title: string;
    value: string;
}

export interface Vehicle {
    acrissCode: string;
    attributes: VehicleAttribute[];
    bagsCount: number;
    brand: string;
    fuelType: string;
    groupType: string;
    id: string;
    images: string[];
    isExcitingDiscount: boolean;
    isMoreLuxury: boolean;
    isNewCar: boolean;
    isRecommended: boolean;
    model: string;
    passengersCount: number;
    transmissionType: string;
    tyreType: string;
    upsellReasons: string[];
    vehicleCost: {
        currency: string;
        value: number;
    };
    vehicleStatus: string;
}

export interface Deal {
    dealInfo: string;
    priceTag?: string;
    pricing: {
        discountPercentage: number;
        displayPrice: {
            amount: number;
            currency: string;
            prefix: string;
            suffix: string;
        };
        listPrice?: {
            amount: number;
            currency: string;
            prefix: string;
            suffix: string;
        };
        totalPrice: {
            amount: number;
            currency: string;
            prefix: string;
            suffix: string;
        };
    };
    tags: string[];
    vehicle: Vehicle;
}

export interface VehiclesResponse {
    deals: Deal[];
    filter: Record<string, unknown>;
    isBundleSelected: boolean;
    quickFilters: Array<Record<string, unknown>>;
    reservationBlockDateTime: Record<string, unknown>;
    reservationId: string;
    terminalList: Array<Record<string, unknown>>;
    totalVehicles: number;
}

export const load: PageServerLoad = async ({ params }) => {
    const bookingId = params.id;

    try {
        const response = await fetch(
            `https://hackatum25.sixt.io/api/booking/${encodeURIComponent(bookingId)}/vehicles`
        );

        if (!response.ok) {
            throw error(response.status, `Failed to fetch vehicles: ${response.statusText}`);
        }

        const data: VehiclesResponse = await response.json();

        return {
            bookingId,
            vehicles: data.deals,
            totalVehicles: data.totalVehicles,
            reservationId: data.reservationId
        };
    } catch (err) {
        if (err instanceof Object && 'status' in err) {
            throw err;
        }

        throw error(500, `Failed to load vehicles: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};
