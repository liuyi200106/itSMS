import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    var target = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000';
    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: target,
                    changeOrigin: true,
                },
                '/media': {
                    target: target,
                    changeOrigin: true,
                },
            },
        },
        preview: {
            host: '0.0.0.0',
            port: 4173,
        },
    };
});
