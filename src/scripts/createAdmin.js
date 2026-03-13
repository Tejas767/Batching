/**
 * createAdmin.js — One-time admin seed script.
 *
 * Run ONCE to create the first admin account in MongoDB:
 *   node src/scripts/createAdmin.js
 *
 * After running, log in with:
 *   username: admin
 *   password: (whatever you set as ADMIN_PASSWORD below)
 *
 * Then change the password from the admin panel immediately!
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

// ─── CONFIGURE THESE BEFORE RUNNING ──────────────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@123456"; // ← Change this!
const ADMIN_DISPLAY_NAME = "Super Admin";
// ─────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes("<username>")) {
  console.error("❌ ERROR: Please set a real MONGODB_URI in your .env file first!");
  process.exit(1);
}

async function main() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { dbName: "batching_system" });
  console.log("✅ Connected!");

  // Define User schema inline (avoid import path issues)
  const UserSchema = new mongoose.Schema({
    username:     { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, default: "operator" },
    isActive:     { type: Boolean, default: true },
    displayName:  { type: String, default: "" },
    expiresAt:    { type: Date, default: null },
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  // Check if admin already exists
  const existing = await User.findOne({ username: ADMIN_USERNAME });
  if (existing) {
    console.log(`⚠️  Admin user "${ADMIN_USERNAME}" already exists. Nothing to do.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create admin
  await User.create({
    username: ADMIN_USERNAME,
    passwordHash,
    role: "admin",
    isActive: true,
    displayName: ADMIN_DISPLAY_NAME,
    expiresAt: null, // Admins never expire
  });

  console.log("─────────────────────────────────────────────");
  console.log("✅ Admin account created successfully!");
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("─────────────────────────────────────────────");
  console.log("⚠️  Please change the password after first login!");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
