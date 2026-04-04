import type { NextConfig } from "next";

const onVercelProduction = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

if (onVercelProduction && !process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
  console.warn(
    "[dpde-app] NEXT_PUBLIC_SITE_URL is not set. metadataBase, robots and sitemap may point at the wrong host.",
  );
}

if (onVercelProduction && !process.env.CONTACT_TO_EMAIL?.trim()) {
  console.warn(
    "[dpde-app] CONTACT_TO_EMAIL is not set. The contact API will return errors until it is configured.",
  );
}

if (
  onVercelProduction &&
  process.env.CONTACT_TO_EMAIL?.trim() &&
  (!process.env.RESEND_API_KEY?.trim() || !process.env.CONTACT_FROM_EMAIL?.trim())
) {
  console.warn(
    "[dpde-app] CONTACT_TO_EMAIL is set but RESEND_API_KEY or CONTACT_FROM_EMAIL is missing. POST /api/contact will return 503 (Mail not configured) until Resend is fully configured.",
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
