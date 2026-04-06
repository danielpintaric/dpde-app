import { AdminAppHeader } from "@/components/admin/admin-app-header";
import { requireAdminSession } from "@/lib/auth/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminSecureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminSession();

  return (
    <>
      <AdminAppHeader />
      <div className="mx-auto min-h-[50vh] max-w-[1600px] px-4 pb-20 pt-4 sm:px-6 sm:pt-5 lg:px-10">
        {children}
      </div>
    </>
  );
}
