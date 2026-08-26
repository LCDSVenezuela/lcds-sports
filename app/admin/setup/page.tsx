import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession, hasAdminUser } from "@/lib/admin-auth";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  try {
    if (await hasAdminUser()) redirect("/admin/login");
  } catch {
    // El formulario será el punto donde se informe cualquier problema de conexión.
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-950 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[30px] bg-white p-6 shadow-2xl sm:p-9 lg:p-10">
          <div className="relative h-14 w-36">
            <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="144px" className="object-contain object-left" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Configuración inicial</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Crea tu acceso administrativo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">Esto se realiza una sola vez. Después entrarás al panel con tu correo y contraseña, sin claves repetidas en cada formulario.</p>
          <SetupForm />
        </section>
      </div>
    </main>
  );
}
