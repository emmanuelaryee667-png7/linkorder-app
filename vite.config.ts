import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline', // Injects registration script directly to prevent network lag
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
          navigateFallback: '/index.html', // Forces offline requests to fall back to index.html instantly
        },
        manifest: {
          name: 'LinkOrder',
          short_name: 'LinkOrder',
          id: 'com.linkorder.app',
          start_url: '/',
          display: 'standalone',
          background_color: '#0072ff',
          theme_color: '#0072ff',
          description: 'LinkOrder empowers local business owners to easily create custom ordering links.',
          icons: [
            {
              src: 'https://img.icons8.com/color-glass/512/shopping-cart.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'https://img.icons8.com/color-glass/512/shopping-cart.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
