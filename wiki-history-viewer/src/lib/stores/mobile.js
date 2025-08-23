import { writable } from "svelte/store";
import { browser } from "$app/environment";

export const isMobileStore = writable(false, (set) => {
    if (!browser) return;

    const check = () =>
        set(window.matchMedia("(max-width: 768px)").matches);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
});
