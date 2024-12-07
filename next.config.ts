import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

withPWA({
  dest: 'public', // PWA 파일이 생성될 경로
  register: true, // 서비스 워커 자동 등록
  skipWaiting: true, // 기존 서비스 워커 대기 없이 새로운 서비스 워커 활성화
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
