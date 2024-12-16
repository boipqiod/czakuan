import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '에대숲 with 시작관',
    short_name: '에대숲',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16b47d',
    icons: [
      {
        src: 'favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  };
}
