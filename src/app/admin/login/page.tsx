import { LoginForm } from "@/components/login-form";
import { configured } from "@/lib/supabase/server";
export const metadata = {
  title: "Acceso · Administración",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return (
    <main id="contenido" className="login-page">
      <LoginForm
        available={configured()}
        initialMode={mode === "update" ? "update" : "login"}
      />
    </main>
  );
}
