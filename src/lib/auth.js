import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default-dev-secret-key-change-in-prod";
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainTextPassword, salt);
}

/**
 * Compare a plain text password with a bcrypt hash
 */
export async function verifyPassword(plainTextPassword, hash) {
  return bcrypt.compare(plainTextPassword, hash);
}

/**
 * Sign a payload into a JWT token
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Verify a JWT token and extract the payload
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Create a session cookie
 */
export async function setSessionCookie(userId, email, name) {
  const payload = { id: userId, email, name };
  const token = await signToken(payload);
  
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Get the current session payload from the cookie
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  return verifyToken(sessionCookie.value);
}
