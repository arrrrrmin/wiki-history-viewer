import { writable } from "svelte/store";


export interface DataSettings {
    allowMinors: boolean;
    allowUnknownEditors: boolean;
}


const DEFAULT_VALUES = {
    allowMinors: true,
    allowUnknownEditors: true,
}


function createDataSettingsStore() {
    const { subscribe, set, update } = writable<DataSettings>(DEFAULT_VALUES)

    return {
        subscribe,

        reset: () => set(DEFAULT_VALUES),

        toggleAllowMinors: () => update(state => {
            return { allowMinors: !state.allowMinors, allowUnknownEditors: state.allowUnknownEditors }
        }),

        toggleAllowUnknownEditors: () => update(state => {
            return { allowMinors: state.allowMinors, allowUnknownEditors: !state.allowUnknownEditors }
        }),
    }
}

export const dataSettingsStore = createDataSettingsStore();