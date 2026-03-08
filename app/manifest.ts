import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CHAMANA - Ropa Femenina Artesanal',
    short_name: 'CHAMANA',
    description: 'Coleccion Magia - Ropa femenina artesanal inspirada en la naturaleza',
    start_url: '/',
    display: 'standalone',
    background_color: '#EFEFE9',
    theme_color: '#223030',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
