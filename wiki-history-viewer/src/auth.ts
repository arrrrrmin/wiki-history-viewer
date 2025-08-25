import { dev } from '$app/environment';

import { SvelteKitAuth } from "@auth/sveltekit"
import Wikimedia from "@auth/sveltekit/providers/wikimedia"
import type { AuthConfig } from "@auth/core/types";


export const { handle, signIn, signOut } = SvelteKitAuth(
    {
        providers: [Wikimedia],
        callbacks: {
            async jwt({ token, account, profile }) {
                // Todo check for blocked profiles
                if (account) {
                    token.access_token = account.access_token;
                }
                return token;
            },
            session({ session, token }) {
                if (token) {
                    //@ts-ignore
                    session.access_token = token.access_token;
                }
                return session;
            },
        },
        debug: dev,
    } satisfies AuthConfig,
);
