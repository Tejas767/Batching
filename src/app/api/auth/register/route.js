import { getDb } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return Response.json({ error: "Email is already registered" }, { status: 409 });
    }

    // Hash password & insert user
    const passwordHash = await hashPassword(password);
    
    // Using a transaction just to be safe
    const result = await db.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, passwordHash, name || ""]
    );

    const user = result.rows[0];

    // Create session (sets HTTP-only cookie)
    await setSessionCookie(user.id, user.email, user.name);

    return Response.json({ data: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
