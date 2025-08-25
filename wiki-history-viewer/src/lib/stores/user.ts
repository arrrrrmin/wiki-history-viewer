import { writable, derived } from "svelte/store";

type UserData = {
    access_token?: string;
    //blocked?: boolean;
    name?: string;
    image?: string;
};

function createUserStore() {
    const { subscribe, set } = writable<UserData | null>({ name: undefined, access_token: undefined, image: undefined });

    return {
        subscribe,

        setUserdata: (name: string, access_token: string, image?: string) => set({ name, access_token, image }),

        reset: () => set({ name: undefined, access_token: undefined, image: undefined })
    };
}

export const userStore = createUserStore();
// export const isBlocked = derived(userStore, ($userStore) => ($userStore && !!$userStore.blocked));
export const isLoggedIn = derived(userStore, ($userStore) => ($userStore && !!$userStore.access_token));
