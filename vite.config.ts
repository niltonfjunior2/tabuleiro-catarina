import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*', 'favicon.ico'],
      manifest: {
        name: 'Tabuleiro Catarina 5 Anos',
        short_name: 'Catarina 5 Anos',
        description: 'Jogo de tabuleiro digital dos unicórnios para o aniversário de 5 anos da Catarina',
        theme_color: '#ec4899',
        background_color: '#fdf2f8',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,webp,svg,mp3,json}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
