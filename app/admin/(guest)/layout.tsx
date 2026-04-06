import { AdminGuestHeader } from "@/components/admin/admin-guest-header";

export default function AdminGuestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AdminGuestHeader />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">{children}</div>
    </>
  );
}
