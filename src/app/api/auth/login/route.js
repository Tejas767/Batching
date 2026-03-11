import { getDb } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user
    const result = await db.query(
      "SELECT id, email, password_hash, name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create session cookie
    await setSessionCookie(user.id, user.email, user.name);

    return Response.json({ data: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
