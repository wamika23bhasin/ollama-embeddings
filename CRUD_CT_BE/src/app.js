import express from "express";
import pg from "pg";
import ollama from "ollama";
import { randomUUID } from "node:crypto";

const MODEL = "qwen3-embedding:0.6b";
const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log("server is running");
});

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "case_tasks_db",
  user: "wamika_sagar"
});

// Get all Case Tasks
app.get("/api/v1/casetasks", async(req, res) => {

    try {
      const result = await pool.query("SELECT * FROM case_tasks");
      res.send({ success: true, count: result.rowsCount, data: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }

  // const caseTasksData = readData();
  // res.send({ success: true, count: caseTasksData.length, data: caseTasksData });
});

app.get("/api/v1/casetasks/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM case_tasks WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Case task not found"
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch case task"
    });
  }
});

// Post a new Case Task
app.post("/api/v1/casetasks", async (req, res) => {
  const payload = req.body ?? {};
  const number = payload.number;
  const issueSummary = payload.issueSummary ?? payload.issue_summary;
  const issueDescription = payload.issueDescription ?? payload.issue_description;
  const releaseVersion = payload.releaseVersion ?? payload.release_version;
  const stepsToReproduce = payload.stepsToReproduce ?? payload.steps_to_reproduce;
  const status = payload.status;
  const priority = payload.priority;
  const assignedTo = payload.assignedTo ?? payload.assigned_to;
  const createdBy = payload.createdBy ?? payload.created_by;
  const createdDate = payload.createdDate ?? payload.created_date;
  const workNotesList = payload.workNotesList ?? payload.work_notes_list ?? [];
  if (
    // typeof id !== "string" || !id.trim() ||
    typeof number !== "string" || !number.trim()
  ) {
    return res.status(400).json({
      message: "Number must be non-empty strings"
    });
  }

  if (
    !Array.isArray(workNotesList) ||
    !workNotesList.every(
      note => note !== null &&
        typeof note === "object" &&
        !Array.isArray(note)
    )
  ) {
    return res.status(400).json({
      message: "workNotesList must be an array of objects"
    });
  }

  let embedding;

  const task = {
    number,
    issueSummary,
    issueDescription,
    releaseVersion,
    stepsToReproduce,
    status,
    priority,
    assignedTo,
    createdBy,
    createdDate,
    workNotesList
  };

try {
  const response = await ollama.embed({
    model: MODEL,
    input: buildIssueText(task),
    truncate: false
  });

  embedding = response.embeddings[0];

  if (
    embedding?.length !== 1024 ||
    !embedding.every(value => Number.isFinite(value))
  ) {
    throw new Error("Invalid embedding");
  }
} catch (error) {
  console.error(error);

  return res.status(502).json({
    message: "Embedding generation failed. Record was not created."
  });
}

  try {
    const id = randomUUID();

    const result = await pool.query(
      `INSERT INTO case_tasks (
        id, number, issue_summary, issue_description,
        release_version, steps_to_reproduce, status, priority,
        assigned_to, created_by, created_date, work_notes_list,
        embedding, embedding_model
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13::vector, $14
      )
      RETURNING id, number, issue_summary, status, priority`,
      [
        id,
        task.number,
        task.issueSummary ?? null,
        task.issueDescription ?? null,
        task.releaseVersion ?? null,
        task.stepsToReproduce ?? null,
        task.status ?? null,
        task.priority ?? null,
        task.assignedTo ?? null,
        task.createdBy ?? null,
        task.createdDate ?? null,
        JSON.stringify(task.workNotesList ?? []),
        JSON.stringify(embedding),
        MODEL
      ]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A task with this id or number already exists"
      });
    }

    if (error.code === "22007" || error.code === "22008") {
      return res.status(400).json({
        message: "createdDate must be a valid date in YYYY-MM-DD format"
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Failed to create case task",
      error: error.message,
      detail: error.detail
    });
  }
});

// Delete a specific Case Task
// app.delete("/api/v1/casetasks/:id", (req, res, next) => {
//   const caseTasksData = readData();
//   let id = req.params.id;
//   let index = caseTasksData.findIndex((task) => task.number === id);
//   if (index === -1) { // ✅ fixed: was !index which treated index 0 as not found
//     const err = new Error(`Case task with number ${id} not found`);
//     err.statusCode = 404;
//     return next(err);
//   }
//   caseTasksData.splice(index, 1);
//   writeData(caseTasksData); // 💾 persist to file
//   res.json({ success: true, message: "CaseTask deleted successfully" });
// });
app.delete("/api/v1/casetasks/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM case_tasks WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Case task not found"
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete case task"
    });
  }
});

// Update a record
app.put("/api/v1/casetasks/:id", async (req, res) => {
try {
  const existingResult = await pool.query(
    "SELECT * FROM case_tasks WHERE id = $1",
    [req.params.id]
  );

  const existing = existingResult.rows[0];
  if (!existing) {
    return res.status(404).json({
      message: "Case task not found"
    });
  }

  const payload = req.body ?? {};

  const getValue = (camel, snake, fallback) => {
    if (payload[camel] !== undefined) return payload[camel];
    if (payload[snake] !== undefined) return payload[snake];
    return fallback;
  };

  const number = getValue("number", "number", existing.number);
  const issueSummary = getValue("issueSummary", "issue_summary", existing.issue_summary);
  const issueDescription = getValue("issueDescription", "issue_description", existing.issue_description);
  const releaseVersion = getValue("releaseVersion", "release_version", existing.release_version);
  const stepsToReproduce = getValue("stepsToReproduce", "steps_to_reproduce", existing.steps_to_reproduce);
  const status = getValue("status", "status", existing.status);
  const priority = getValue("priority", "priority", existing.priority);
  const assignedTo = getValue("assignedTo", "assigned_to", existing.assigned_to);
  const createdBy = getValue("createdBy", "created_by", existing.created_by);
  const createdDate = getValue("createdDate", "created_date", existing.created_date);
  
  // Append new work notes to the existing list
  const incomingWorkNotes = payload.workNotesList ?? payload.work_notes_list;
  let workNotesList = existing.work_notes_list || [];
  if (Array.isArray(incomingWorkNotes) && incomingWorkNotes.length > 0) {
    workNotesList = [...workNotesList, ...incomingWorkNotes];
  }

  if (typeof number !== "string" || !number.trim()) {
    return res.status(400).json({
      message: "number must be a non-empty string"
    });
  }

  if (
    !Array.isArray(workNotesList) ||
    !workNotesList.every(
      note => note !== null && typeof note === "object" && !Array.isArray(note)
    )
  ) {
    return res.status(400).json({
      message: "workNotesList must be an array of objects"
    });
  }

  const task = {
    number,
    issueSummary,
    issueDescription,
    releaseVersion,
    stepsToReproduce,
    status,
    priority,
    assignedTo,
    createdBy,
    createdDate,
    workNotesList
  };

  const oldText = buildIssueText({
    issueSummary: existing.issue_summary,
    issueDescription: existing.issue_description,
    stepsToReproduce: existing.steps_to_reproduce
  });

  const newText = buildIssueText(task);

  let embedding = existing.embedding;
  let embeddingModel = existing.embedding_model;

  if (
    oldText !== newText ||
    !embedding ||
    embeddingModel !== MODEL
  ) {
    try {
      const response = await ollama.embed({
        model: MODEL,
        input: newText,
        truncate: false
      });

      const vector = response.embeddings[0];

      if (
        vector?.length !== 1024 ||
        !vector.every(value => Number.isFinite(value))
      ) {
        throw new Error("Invalid embedding");
      }

      embedding = JSON.stringify(vector);
      embeddingModel = MODEL;
    } catch (error) {
      console.error(error);

      return res.status(502).json({
        message: "Embedding generation failed. Record was not updated."
      });
    }
  }

  const result = await pool.query(
    `UPDATE case_tasks
     SET number = $1,
         issue_summary = $2,
         issue_description = $3,
         release_version = $4,
         steps_to_reproduce = $5,
         status = $6,
         priority = $7,
         assigned_to = $8,
         created_by = $9,
         created_date = $10,
         work_notes_list = $11,
         embedding = $12::vector,
         embedding_model = $13
     WHERE id = $14
     RETURNING id, number, issue_summary, status, priority`,
    [
      task.number,
      task.issueSummary ?? null,
      task.issueDescription ?? null,
      task.releaseVersion ?? null,
      task.stepsToReproduce ?? null,
      task.status ?? null,
      task.priority ?? null,
      task.assignedTo ?? null,
      task.createdBy ?? null,
      task.createdDate ?? null,
      JSON.stringify(task.workNotesList ?? []),
      embedding,
      embeddingModel,
      req.params.id
    ]
  );
  
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Case task not found"
    });
  }
  
  return res.json(result.rows[0]);

} catch (error) {
  if (error.code === "23505") {
    return res.status(409).json({
      message: "A task with this number already exists"
    });
  }

  if (error.code === "22007" || error.code === "22008") {
    return res.status(400).json({
      message: "createdDate must be a valid date"
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Failed to update case task"
  });
}
  // try {
  //   const result = await pool.query(
  //     `UPDATE case_tasks
  //      SET number = $1,
  //          issue_summary = $2,
  //          issue_description = $3,
  //          release_version = $4,
  //          steps_to_reproduce = $5,
  //          status = $6,
  //          priority = $7,
  //          assigned_to = $8,
  //          created_by = $9,
  //          created_date = $10,
  //          work_notes_list = $11
  //      WHERE id = $12
  //      RETURNING *`,
  //     [
  //       number,
  //       issueSummary ?? null,
  //       issueDescription ?? null,
  //       releaseVersion ?? null,
  //       stepsToReproduce ?? null,
  //       status ?? null,
  //       priority ?? null,
  //       assignedTo ?? null,
  //       createdBy ?? null,
  //       createdDate ?? null,
  //       JSON.stringify(workNotesList),
  //       req.params.id
  //     ]
  //   );

  //   if (result.rows.length === 0) {
  //     return res.status(404).json({
  //       message: "Case task not found"
  //     });
  //   }

  //   return res.json(result.rows[0]);
  // } catch (error) {
  //   if (error.code === "23505") {
  //     return res.status(409).json({
  //       message: "A task with this number already exists"
  //     });
  //   }

  //   if (error.code === "22007" || error.code === "22008") {
  //     return res.status(400).json({
  //       message: "createdDate must be a valid date"
  //     });
  //   }

  //   console.error(error);
  //   return res.status(500).json({
  //     message: "Failed to update case task"
  //   });
  // }
});

app.get("/api/v1/casetasks/:number/similar", async (req, res) => {
  const threshold = 0.8; // Initial cutoff; tune using your examples.

  try {
     // Inside your existing try block:
    const { rows } = await pool.query(
      `SELECT id, embedding, embedding_model
      FROM case_tasks
      WHERE number = $1`,
      [req.params.number]
    );

    const current = rows[0];

    if (!current) {
      return res.status(404).json({
        message: "Case task not found"
      });
    }

    if (!current.embedding || !current.embedding_model) {
      return res.status(409).json({
        message: "Embedding is missing for this record"
      });
    }

    const result = await pool.query(
      `SELECT id, number, issue_summary,
              1 - (embedding <=> $1::vector) AS similarity
       FROM case_tasks
       WHERE id <> $2
         AND embedding IS NOT NULL
         AND embedding_model = $3
         AND 1 - (embedding <=> $1::vector) >= $4
       ORDER BY similarity DESC`,
      [
        current.embedding,
        current.id,
        current.embedding_model,
        threshold
      ]
    );

    return res.json({
      similarRecordCount: result.rows.length,
      similarRecords: result.rows
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch similar records"
    });
  }
});

// Global error handler
app.use((err, req, res, next) => { // ✅ fixed: next was missing in route scopes before
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, error: err.message });
});

function buildIssueText(task) {
  return [
    `Summary: ${task.issueSummary ?? ""}`,
    `Description: ${task.issueDescription ?? ""}`,
    `Steps: ${task.stepsToReproduce ?? ""}`,
  ].join("\n");
}