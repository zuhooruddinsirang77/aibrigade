/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // We reference the original brand assets straight from Webflow's CDN + S3.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "s3.amazonaws.com" },
      { protocol: "https", hostname: "d3e54v103j8qbb.cloudfront.net" },
    ],
  },
};

export default nextConfig;
