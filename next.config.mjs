/** @type {import('next').NextConfig} */
const nextConfig = {
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
