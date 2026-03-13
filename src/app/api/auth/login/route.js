/**
 * /api/auth/login — POST
 *
 * Authenticates a user with username + password.
 * Checks: account active, subscription not expired, credentials valid.
 * Sets a JWT session cookie on success.
 */
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectDB();

    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Find user (exact case match)
    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return Response.json({ error: "Username not found" }, { status: 401 });
    }

    // Check if account is active
    if (!user.isActive) {
      return Response.json({ error: "Your account has been disabled. Contact admin." }, { status: 403 });
    }

    // Check subscription expiry (operators only — admins never expire)
    if (user.role === "operator" && user.expiresAt && new Date() > user.expiresAt) {
      // Auto-disable expired account
      await User.findByIdAndUpdate(user._id, { isActive: false });
      return Response.json(
        { error: "Your subscription has expired. Contact admin to renew." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Set JWT session cookie
    await setSessionCookie(user._id.toString(), user.username, user.role);

    return Response.json({
      data: {
        id:            user._id,
        username:      user.username,
        displayName:   user.displayName || user.username,
        role:          user.role,
        daysRemaining: user.daysRemaining,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
