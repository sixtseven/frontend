import { writable } from "svelte/store";
import type { Deal } from "../routes/kiosk/[id]/vehicle/+page.server";


export interface Recommendations {
    base_car: { raw: Deal }
    upsell_car: { raw: Deal }
    upsell_reasons: string[]
}

export const recommendationsStore = writable<Recommendations | undefined>(undefined);