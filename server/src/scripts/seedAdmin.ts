import { connectDB, disconnectDB } from "../config/db.js";
import { User, hashPassword } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  await connectDB();
  const email = (arg("email") ?? "admin@example.com").toLowerCase();
  const password = arg("password") ?? "Admin1234!";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.status = "active";
    existing.passwordHash = await hashPassword(password);
    await existing.save();
    console.log(`[seed] updated existing admin: ${email}`);
  } else {
    await User.create({
      name: "Platform Admin",
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
    });
    console.log(`[seed] created admin: ${email}`);
  }

  await AuditLog.create({
    adminId: (await User.findOne({ email }))!._id,
    action: "system.seed",
    targetType: "system",
    targetId: "admin-seed",
    meta: { note: "Admin provisioned via seed script" },
  });

  console.log(`[seed] login with ${email} / ${password}`);
  await disconnectDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
