import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event): Promise<{
    user: {
        name?: string;
        email?: string;
        image?: string;
        access_token?: string;
        profile?: {
            blocked?: boolean;
        };
    };
} | undefined> => {
    const session = await event.locals.auth();
    // if (!session || !session?.user) {
    //     return new Response(null, { status: 401, statusText: "Unauthorized" })
    // }
    return { session }
}