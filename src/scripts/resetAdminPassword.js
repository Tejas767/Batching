import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

// ─── CONFIGURE YOUR NEW PASSWORD HERE ───────────────
const NEW_PASSWORD = "YOUR_NEW_SECRET_PASSWORD_HERE"; 
// ───────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI not found in .env!");
  process.exit(1);
}

async function main() {
  console.log("🔗 Connecting to Database...");
  await mongoose.connect(MONGODB_URI, { dbName: "batching_system" });

  const UserSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    role: String
  });
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  console.log("🔍 Finding admin account...");
  const admin = await User.findOne({ role: "admin" });

  if (!admin) {
    console.error("❌ ERROR: Admin account not found!");
    process.exit(1);
  }

  console.log("🔐 Hashing new password...");
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);

  admin.passwordHash = hash;
  await admin.save();

  console.log("─────────────────────────────────────────────");
  console.log("✅ SUCCESS! Admin password has been updated.");
  console.log("   You can now log in with your new password.");
  console.log("─────────────────────────────────────────────");

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("❌ FAILED:", err.message);
  process.exit(1);
});
