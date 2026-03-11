/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false, // Disables the Static/ISR indicator
    buildActivity: false, // Disables the "Compiling..." / Next.js logo bubble
  },
};

export default nextConfig;
