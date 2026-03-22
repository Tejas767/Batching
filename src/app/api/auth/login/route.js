/**
 * /api/auth/login — POST
 *
 * Authenticates a user with username + password.
 * Checks: account active, subscription not expired, credentials valid.
 * Sets a JWT session cookie on success.
 * Rate limited: max 10 attempts per IP per 15 minutes.
 */
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── In-memory rate limiter ──────────────────────────
// For production at scale, replace with Upstash Redis
const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);

  // No record or window expired — start fresh
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  // Within window — check count
  if (record.count >= maxAttempts) return true; // rate limited

  record.count++;
  loginAttempts.set(ip, record);
  return false;
}

// Clean up old entries every 30 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of loginAttempts) {
    if (now > val.resetAt) loginAttempts.delete(key);
  }
}, 30 * 60 * 1000);

export async function POST(request) {
  // Rate limit check
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

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
