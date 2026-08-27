import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { db, ensureCatalogSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

async function resetPreviewAdmin() {
  "use server";

  if (process.env.VERCEL_ENV !== "preview") {
    throw new Error("Esta acción solo está disponible en Preview.");
  }

  await ensureCatalogSchema();
  const sql = db();

  await sql.begin(async (tx) => {
    await tx`delete from admin_sessions`;
    await tx`delete from admin_users`;
  });

  redirect("/admin/setup");
}

export default function ResetPreviewAdminPage() {
  if (process.env.VERCEL_ENV !== "preview") notFound();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-950 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[30px] bg-white p-6 shadow-2xl sm:p-9 lg:p-10">
          <div className="relative h-14 w-36">
            <Image src="/brand/lcds-logo.png" alt="LCDS Sports" fill sizes="144px" className="object-contain object-left" />
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Solo entorno Preview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Reiniciar acceso administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            La base de datos ya contiene un administrador creado durante las pruebas. Esta acción elimina únicamente el acceso administrativo y sus sesiones. No modifica productos, precios, banners, tasa BCV ni imágenes.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Después podrás crear tu propio correo y contraseña desde cero.
          </div>

          <form action={resetPreviewAdmin} className="mt-6">
            <button type="submit" className="min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white transition hover:bg-neutral-800">
              REINICIAR ACCESO Y CREAR MI ADMINISTRADOR
            </button>
          </form>

          <a href="/admin/login" className="mt-4 flex min-h-11 items-center justify-center text-xs font-black text-neutral-500 hover:text-neutral-950">
            Volver al inicio de sesión
          </a>
        </section>
      </div>
    </main>
  );
}
