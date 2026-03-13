/**
 * /api/admin/users — GET + POST
 *
 * GET  → list all operator users (admin only)
 * POST → create a new operator user (admin only)
 */
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── GET: list all users ───────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const users = await User.find({ role: "operator" })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const data = users.map((u) => ({
      id:                u._id,
      username:          u.username,
      displayName:       u.displayName,
      isActive:          u.isActive,
      subscriptionStart: u.subscriptionStart,
      subscriptionDays:  u.subscriptionDays,
      expiresAt:         u.expiresAt,
      daysRemaining:     u.expiresAt
        ? Math.max(0, Math.ceil((new Date(u.expiresAt) - Date.now()) / 86400000))
        : null,
      notes:             u.notes,
      createdAt:         u.createdAt,
    }));

    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: create a new operator ───────────────────────────────
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const { username, password, displayName, subscriptionDays, notes } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Check for duplicate
    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return Response.json({ error: "Username already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const now = new Date();
    const days = Number(subscriptionDays) || 30;
    const expiresAt = new Date(now.getTime() + days * 86400000);

    const user = await User.create({
      username:          username.trim(),
      passwordHash,
      displayName:       displayName || username,
      role:              "operator",
      isActive:          true,
      subscriptionStart: now,
      subscriptionDays:  days,
      expiresAt,
      notes:             notes || "",
      createdBy:         session.id,
    });

    return Response.json({
      data: {
        id:           user._id,
        username:     user.username,
        displayName:  user.displayName,
        expiresAt:    user.expiresAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
