import pg from "pg";
import { readFile } from "node:fs/promises";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "case_tasks_db",
  user: "wamika_sagar"
});

async function main() {
  let imported = 0;
  let skipped = 0;

  try {
    const tasks = JSON.parse(
      await readFile(
        new URL("./data/casetasks.data1.json", import.meta.url),
        "utf8"
      )
    );

    if (!Array.isArray(tasks)) {
      throw new Error("JSON file must contain an array of tasks");
    }

    for (const task of tasks) {
      if (
        typeof task?.number !== "string" ||
        !task.number.trim()
      ) {
        throw new Error("Each task must have a non-empty number");
      }

      const workNotesList = task.workNotesList ?? [];

      if (
        !Array.isArray(workNotesList) ||
        !workNotesList.every(
          note =>
            note !== null &&
            typeof note === "object" &&
            !Array.isArray(note)
        )
      ) {
        throw new Error(
          `${task.number}: workNotesList must be an array of objects`
        );
      }

      const result = await pool.query(
        `INSERT INTO case_tasks (
          number,
          issue_summary,
          issue_description,
          release_version,
          steps_to_reproduce,
          status,
          priority,
          assigned_to,
          created_by,
          created_date,
          work_notes_list
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11
        )
        ON CONFLICT (number) DO NOTHING
        RETURNING id, number`,
        [
          task.number.trim(),
          task.issueSummary ?? null,
          task.issueDescription ?? null,
          task.releaseVersion ?? null,
          task.stepsToReproduce ?? null,
          task.status ?? null,
          task.priority ?? null,
          task.assignedTo ?? null,
          task.createdBy ?? null,
          task.createdDate ?? null,
          JSON.stringify(workNotesList)
        ]
      );

      if (result.rowCount === 1) {
        imported++;
        console.log("Imported:", result.rows[0]);
      } else {
        skipped++;
        console.log("Skipped existing task:", task.number);
      }
    }

    console.log(`Finished. Imported: ${imported}, skipped: ${skipped}`);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});