import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession, hasAdminUser } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  try {
    if (!(await hasAdminUser())) redirect("/admin/setup");
  } catch {
    // El formulario mostrará el error real si la base todavía no responde.
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-950 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden text-white lg:block">
          <div className="relative h-16 w-44 rounded-2xl bg-white p-2">
            <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="176px" className="object-contain p-2" />
          </div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">Administración privada</p>
          <h1 className="mt-3 max-w-lg text-5xl font-black leading-[0.96] tracking-[-0.045em]">Controla tu tienda desde un solo lugar.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-400">Productos, banners, tasa BCV, imágenes y mayoristas con una sesión segura y persistente.</p>
        </div>

        <section className="rounded-[30px] bg-white p-6 shadow-2xl sm:p-9 lg:p-10">
          <div className="relative h-14 w-36 lg:hidden">
            <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="144px" className="object-contain object-left" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 lg:mt-0">LCDS Sports</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Iniciar sesión</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">Acceso exclusivo al panel administrativo.</p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
