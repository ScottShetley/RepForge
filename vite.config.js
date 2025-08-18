import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig ({
  plugins: [
    react (),
    VitePWA ({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RepForge',
        short_name: 'RepForge',
        description: 'A workout tracker for the StrongLifts 5x5 program.',
        theme_color: '#1F2937', // A dark theme color
        background_color: '#111827',
        icons: [
          {
            src: 'icons/192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
