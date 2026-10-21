"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Tag,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Image,
  Mail,
  Palette,
  Sparkles,
  Settings,
  ArrowUpRight,
  LogOut,
  Compass,
} from "lucide-react";
import { adminNavigation } from "@/lib/admin-navigation";
import { authAction } from "@/app/admin/actions";
import { useState } from "react";
const icons = [
  LayoutDashboard,
  User,
  FolderOpen,
  Tag,
  Compass,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Image,
  Mail,
  Palette,
  Sparkles,
  Settings,
];
export function AdminShell({
  children,
  demo,
}: {
  children: React.ReactNode;
  demo: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [notice, setNotice] = useState("");
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="wordmark" href="/admin">
          Mi portafolio<span>ESPACIO EDITORIAL</span>
        </Link>
        <nav aria-label="Administración">
          {adminNavigation.map(([slug, label], i) => {
            const Icon = icons[i];
            return (
              <Link
                href={`/admin${slug ? `/${slug}` : ""}`}
                key={slug}
                aria-current={
                  pathname === `/admin${slug ? `/${slug}` : ""}`
                    ? "page"
                    : undefined
                }
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main" id="contenido">
        <div className="admin-topbar">
          <span>
            {demo ? "VISTA DE DEMOSTRACIÓN" : "TU ESPACIO DE CREACIÓN"}
          </span>
          <div className="row-actions">
            <Link className="text-link" href="/" target="_blank">
              Ver sitio <ArrowUpRight size={14} />
            </Link>
            {!demo && (
              <button
                aria-label="Cerrar sesión"
                onClick={async () => {
                  const r = await authAction("logout", "", "");
                  if (r.ok) {
                    router.push("/admin/login");
                    router.refresh();
                  } else setNotice(r.message);
                }}
              >
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>
        {demo && (
          <div className="notice">
            Demostración local de solo lectura. Para guardar cambios, configura
            Supabase y crea tu cuenta administrativa.{" "}
            <Link href="/admin/configuracion">
              <u>Ver instrucciones</u>
            </Link>
            .
          </div>
        )}
        {notice && <p role="alert">{notice}</p>}
        {children}
      </main>
    </div>
  );
}
