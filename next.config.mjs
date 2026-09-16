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
  // components/video.data.js's own comments assume "browser cache makes the
  // second request nearly free" for a film reused across sections — true
  // only once a response is actually cacheable long-term, and Next's default
  // static headers don't promise that. Most of these 14 clips back 2+
  // <AmbientVideo> instances (fintechGrowth alone backs six, at 5.9MB;
  // geneEditing backs five, at 14.9MB), so without this, every repeat
  // mount either re-fetches or spends a round trip revalidating a file that
  // never changes without also changing name. `immutable` is safe here
  // specifically because /video is the curated, provenance-tracked manifest
  // in video.data.js — swapping a clip's content means editing that file
  // too, which is the cue to rename it.
  //
  // Deliberately NOT applied to /reels: those paths are placeholders for
  // client footage that doesn't exist yet (see deployments.data.js) and
  // will land at their current names once shot, which a long-lived
  // immutable cache would then hide from returning visitors.
  async headers() {
    return [
      {
        source: "/video/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
