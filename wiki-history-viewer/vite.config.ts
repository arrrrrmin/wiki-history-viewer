import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
  define: {
    __MOCK_RESPONSE__: JSON.stringify(process.env.MOCK_RESPONSE || false)
  }
});