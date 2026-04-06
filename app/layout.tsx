import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import { RootPublicShell } from "@/components/root-public-shell";
import { getMetadataBaseUrl } from "@/lib/public-config";
import { getResolvedSiteGlobal } from "@/lib/services/site-global";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedSiteGlobal();
  const brand = site.brandName;
  const locationPart = site.locationCity?.trim() ? `, ${site.locationCity.trim()}` : ", Berlin";
  const description = site.bioLine?.trim()
    ? `${site.bioLine.trim()} — ${brand}.`
    : `Portrait and editorial photography — ${brand}${locationPart}. Commissions and collaborations by availability.`;
  return {
    metadataBase: getMetadataBaseUrl(),
    title: {
      default: `${brand} — Photography`,
      template: `%s — ${brand}`,
    },
    description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteGlobal = await getResolvedSiteGlobal();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-zinc-950 font-sans text-zinc-100">
        <RootPublicShell siteGlobal={siteGlobal}>
          <PageTransition>{children}</PageTransition>
        </RootPublicShell>
      </body>
    </html>
  );
}
