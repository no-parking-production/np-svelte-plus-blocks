import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['blocks.nopark.net'],
		host: '0.0.0.0',
		port: 3000,
	}
});
