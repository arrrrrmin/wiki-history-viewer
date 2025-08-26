// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: () => Promise<{
				user: {
					name?: string;
					email?: string;
					image?: string;
					access_token?: string;
					profile?: {
						blocked?: boolean;
					};
				};
			} | null>;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
