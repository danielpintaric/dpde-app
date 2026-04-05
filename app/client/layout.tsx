import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client area",
  robots: { index: false, follow: false },
};

export default function ClientRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
