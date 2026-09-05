import { User, hashPassword } from "../models/User.js";
import { Lesson } from "../models/Lesson.js";
import { getSettings } from "../models/Settings.js";
import { LESSONS } from "../data/lessons.js";

/** Idempotent startup data: default admin (if none), canonical lessons, settings. */
export async function bootstrapDevData(): Promise<void> {
  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount === 0) {
    const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
    const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
    await User.create({
      name: "Platform Admin",
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
    });
    console.log(`[bootstrap] created default admin: ${email} (password from SEED_ADMIN_PASSWORD)`);
  }

  for (const seed of LESSONS) {
    await Lesson.findOneAndUpdate(
      { conceptId: seed.conceptId },
      { $setOnInsert: seed },
      { upsert: true }
    );
  }
  await getSettings();
  console.log(`[bootstrap] ${LESSONS.length} lessons ready`);
}
