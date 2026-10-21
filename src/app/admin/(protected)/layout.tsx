import { redirect } from "next/navigation";
import { isDemo, requireAdmin } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administración · Portafolio",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemo();
  if (!demo) {
    try {
      await requireAdmin();
    } catch {
      redirect("/admin/login");
    }
  }
  return <AdminShell demo={demo}>{children}</AdminShell>;
}
