import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, ensureCatalogSchema } from "@/lib/db";

const SESSION_COOKIE = "lcds_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

type AdminSession = {
  userId: number;
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function passwordDigest(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function safeEqualHex(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hasAdminUser() {
  await ensureCatalogSchema();
  const rows = await db()`select count(*)::int as count from admin_users`;
  return Number(rows[0]?.count ?? 0) > 0;
}

export async function createInitialAdmin(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) throw new Error("Ingresa un correo válido");
  if (password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");

  await ensureCatalogSchema();
  const sql = db();
  const salt = randomBytes(16).toString("hex");
  const hash = passwordDigest(password, salt);

  return sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(72633741)`;
    const existing = await tx`select count(*)::int as count from admin_users`;
    if (Number(existing[0]?.count ?? 0) > 0) throw new Error("El administrador inicial ya fue creado");

    const rows = await tx`
      insert into admin_users (email, password_hash, password_salt)
      values (${normalizedEmail}, ${hash}, ${salt})
      returning id, email
    `;

    return { userId: Number(rows[0].id), email: String(rows[0].email) };
  });
}

async function issueSession(userId: number, email: string) {
  await ensureCatalogSchema();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const sessionId = randomUUID();
  const sql = db();

  await sql`delete from admin_sessions where expires_at <= now()`;
  await sql`
    insert into admin_sessions (id, user_id, token_hash, expires_at)
    values (${sessionId}, ${userId}, ${tokenHash}, now() + interval '30 days')
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  return { userId, email } satisfies AdminSession;
}

export async function loginAdmin(email: string, password: string) {
  await ensureCatalogSchema();
  const normalizedEmail = normalizeEmail(email);
  const rows = await db()`
    select id, email, password_hash, password_salt
    from admin_users
    where email = ${normalizedEmail}
    limit 1
  `;

  const user = rows[0];
  if (!user) throw new Error("Correo o contraseña incorrectos");

  const incomingHash = passwordDigest(password, String(user.password_salt));
  if (!safeEqualHex(incomingHash, String(user.password_hash))) {
    throw new Error("Correo o contraseña incorrectos");
  }

  return issueSession(Number(user.id), String(user.email));
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    await ensureCatalogSchema();
    const rows = await db()`
      select u.id as user_id, u.email
      from admin_sessions s
      join admin_users u on u.id = s.user_id
      where s.token_hash = ${hashToken(token)}
        and s.expires_at > now()
      limit 1
    `;

    if (!rows[0]) return null;
    return { userId: Number(rows[0].user_id), email: String(rows[0].email) };
  } catch {
    return null;
  }
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdminApi() {
  return Boolean(await getAdminSession());
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await ensureCatalogSchema();
      await db()`delete from admin_sessions where token_hash = ${hashToken(token)}`;
    } catch {
      // La cookie igualmente se elimina aunque la base esté temporalmente fuera de línea.
    }
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
