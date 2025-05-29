import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/tests/setuptest.ts'],
    },
});
