import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Foundation30 - Bảo hiểm Doanh nghiệp Cao cấp',
    short_name: 'Foundation30',
    description: 'Giải pháp bảo hiểm và phúc lợi toàn diện cho doanh nghiệp hiện đại',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a237e',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
