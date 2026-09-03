import { connectDB, disconnectDB } from "../config/db.js";
import { Lesson } from "../models/Lesson.js";
import { Settings } from "../models/Settings.js";
import { LESSONS } from "../data/lessons.js";

async function main() {
  await connectDB();

  for (const seed of LESSONS) {
    await Lesson.findOneAndUpdate(
      { conceptId: seed.conceptId },
      { $setOnInsert: seed },
      { upsert: true }
    );
    console.log(`[seed] lesson upserted: ${seed.conceptId}`);
  }

  await Settings.findById("global").then(async (s) => {
    if (!s) {
      await Settings.create({ _id: "global" });
      console.log("[seed] default curriculum settings created");
    }
  });

  await disconnectDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
