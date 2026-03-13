/**
 * /api/admin/users/[id] — PATCH + DELETE
 *
 * PATCH  → update user (toggle active, reset password, update notes)
 * DELETE → delete user account + ALL their records
 */
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import BatchRecord from "@/lib/models/BatchRecord";
import { getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── PATCH: update user ────────────────────────────────────────
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const updates = {};

    // Toggle active/inactive
    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    // Reset password
    if (body.newPassword) {
      updates.passwordHash = await hashPassword(body.newPassword);
    }

    // Update notes / displayName
    if (body.displayName !== undefined) updates.displayName = body.displayName;
    if (body.notes !== undefined)       updates.notes = body.notes;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      data: {
        id:        user._id,
        username:  user.username,
        isActive:  user.isActive,
        expiresAt: user.expiresAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE: remove user account + all their records ────────────
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await params;

    // 1. Delete the user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Delete all batch records belonging to this user
    await BatchRecord.deleteMany({ userId: id });

    return Response.json({ data: { deleted: true, username: user.username } });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
