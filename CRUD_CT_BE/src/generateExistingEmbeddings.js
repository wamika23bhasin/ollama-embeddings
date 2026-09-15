import pg from "pg";
import ollama from "ollama";

const { Pool } = pg;
const MODEL = "qwen3-embedding:0.6b";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "case_tasks_db",
  user: "wamika_sagar"
});

// Database fields use snake_case.
function buildIssueText(task) {
  return [
    `Summary: ${task.issue_summary ?? ""}`,
    `Description: ${task.issue_description ?? ""}`,
    `Steps: ${task.steps_to_reproduce ?? ""}`,
  ].join("\n");
}

async function main() {
  let saved = 0;
  let failed = 0;

  try {
    const { rows: tasks } = await pool.query(
      `SELECT id, number, issue_summary, issue_description,
              steps_to_reproduce
       FROM case_tasks
       ORDER BY number`
    );

    console.log(`Processing ${tasks.length} records...`);

    for (const task of tasks) {
      try {
        const response = await ollama.embed({
          model: MODEL,
          input: buildIssueText(task),
          truncate: false
        });

        const embedding = response.embeddings[0];

        if (
          !embedding?.length ||
          !embedding.every(value => Number.isFinite(value))
        ) {
          throw new Error("Invalid embedding returned by Ollama");
        }

        const result = await pool.query(
          `UPDATE case_tasks
           SET embedding = $1::vector,
               embedding_model = $2
           WHERE id = $3
             AND issue_summary IS NOT DISTINCT FROM $4::text
             AND issue_description IS NOT DISTINCT FROM $5::text
             AND steps_to_reproduce IS NOT DISTINCT FROM $6::text`,
          [
            JSON.stringify(embedding),
            MODEL,
            task.id,
            task.issue_summary,
            task.issue_description,
            task.steps_to_reproduce
          ]
        );

        if (result.rowCount === 0) {
          throw new Error("Record changed or was deleted; rerun the script");
        }

        saved++;
        console.log(`Saved: ${task.number}`);
      } catch (error) {
        failed++;
        console.error(`Failed: ${task.number} — ${error.message}`);
      }
    }

    console.log(`Finished. Saved: ${saved}, failed: ${failed}`);

    if (failed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});