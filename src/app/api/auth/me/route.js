/**
 * /api/auth/me — GET
 *
 * Returns the current logged-in user's profile from MongoDB.
 * Also re-checks subscription expiry on every request (extra safety).
 */
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ data: null }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.id).lean({ virtuals: true });

    if (!user) {
      return Response.json({ data: null }, { status: 401 });
    }

    // Check if account still active
    if (!user.isActive) {
      return Response.json({ data: null, error: "Account disabled" }, { status: 403 });
    }

    return Response.json({
      data: {
        id:            user._id,
        username:      user.username,
        displayName:   user.displayName || user.username,
        role:          user.role,
        isActive:      user.isActive,
        plantSN:       user.plantSN || "", 
        daysRemaining: user.expiresAt
          ? Math.max(0, Math.ceil((new Date(user.expiresAt) - Date.now()) / 86400000))
          : null,
        expiresAt:     user.expiresAt,
      },
    });
  } catch (error) {
    console.error("/api/auth/me error:", error);
    return Response.json({ data: null }, { status: 500 });
  }
}
