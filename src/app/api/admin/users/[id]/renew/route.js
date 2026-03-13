/**
 * /api/admin/users/[id]/renew — POST
 *
 * Renews a user's subscription by adding days.
 * If already expired: starts fresh from today.
 * If still active:    extends from their current expiry date.
 * Auto re-enables the account on renewal.
 */
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { days, mode = "add" } = await request.json();

    if (!days || Number(days) < 0) {
      return Response.json({ error: "days must be a non-negative number" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const daysNum = Number(days);

    let newExpiry;
    if (mode === "set") {
      // Set total days from NOW
      newExpiry = new Date(Date.now() + daysNum * 86400000);
      user.subscriptionDays = daysNum;
    } else {
      // Add to current expiry if active, else start from today
      const base = user.expiresAt && user.expiresAt > new Date()
        ? user.expiresAt
        : new Date();
      newExpiry = new Date(base.getTime() + daysNum * 86400000);
      user.subscriptionDays = (user.subscriptionDays || 0) + daysNum;
    }

    user.expiresAt = newExpiry;
    user.isActive  = true; // always re-enable on renewal
    await user.save();

    const daysRemaining = Math.max(0, Math.ceil((newExpiry - Date.now()) / 86400000));

    return Response.json({
      data: {
        username:     user.username,
        expiresAt:    user.expiresAt,
        daysRemaining,
        isActive:     user.isActive,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/users/[id]/renew error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
