/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow builds to succeed even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow builds with TS warnings (strict checks done in CI)
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
