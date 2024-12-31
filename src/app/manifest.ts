import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === 'production';

  const name = isProd ? '에대숲 with 시작관' : '에대숲 with 시작관 (개발)';
  const shortName = isProd ? '에대숲' : '에대숲 (개발)';

  return {
    name: name,
    short_name: shortName,
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
