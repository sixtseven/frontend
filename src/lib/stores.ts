import { writable } from "svelte/store";

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

export interface Recommendations {
    base_car: { raw: Deal }
    upsell_car: { raw: Deal }
    upsell_reasons: string[]
}

export const recommendationsStore = writable<Recommendations | undefined>(undefined);