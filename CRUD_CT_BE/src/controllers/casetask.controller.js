import sampleCaseTasks from '../data/casetasks.data.js';

// In-memory store seeded from sample data — replace with your DB layer (Mongoose, Prisma, etc.)
let caseTasks = [...sampleCaseTasks];

// Helper to generate next unique CSTSK number
const getNextNumber = () => {
  const max = caseTasks.reduce((acc, t) => {
    const num = parseInt(t.number.replace('CSTSK', ''), 10);
    return num > acc ? num : acc;
  }, 0);
  return `CSTSK${max + 1}`;
};

// GET /api/v1/casetasks
export const getAllCaseTasks = (_req, res) => {
  res.json({ success: true, count: caseTasks.length, data: caseTasks });
};

// GET /api/v1/casetasks/:id
export const getCaseTaskById = (req, res, next) => {
  const task = caseTasks.find((t) => t.id === req.params.id);
  if (!task) {
    const err = new Error(`CaseTask with id '${req.params.id}' not found`);
    err.statusCode = 404;
    return next(err);
  }
  res.json({ success: true, data: task });
};

// POST /api/v1/casetasks
export const createCaseTask = (req, res, next) => {
  const { issueSummary, issueDescription, releaseVersion, stepsToReproduce, status, priority, assignedTo, createdBy, workNotesList, createdDate } = req.body;
  if (!issueSummary || !status || !priority) {
    const err = new Error('issueSummary, status, and priority are required');
    err.statusCode = 400;
    return next(err);
  }
  const newTask = {
    number: getNextNumber(),
    id: String(Date.now()),
    issueSummary,
    issueDescription: issueDescription || '',
    releaseVersion: releaseVersion || '',
    stepsToReproduce: stepsToReproduce || '',
    status,
    priority,
    assignedTo: assignedTo || '',
    createdBy: createdBy || '',
    createdDate: createdDate || new Date().toISOString(),
    workNotesList: workNotesList || [],
  };
  caseTasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
};

// PUT /api/v1/casetasks/:id
export const updateCaseTask = (req, res, next) => {
  const index = caseTasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    const err = new Error(`CaseTask with id '${req.params.id}' not found`);
    err.statusCode = 404;
    return next(err);
  }
  caseTasks[index] = { ...caseTasks[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: caseTasks[index] });
};

// DELETE /api/v1/casetasks/:id
export const deleteCaseTask = (req, res, next) => {
  const index = caseTasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    const err = new Error(`CaseTask with id '${req.params.id}' not found`);
    err.statusCode = 404;
    return next(err);
  }
  caseTasks.splice(index, 1);
  res.json({ success: true, message: 'CaseTask deleted successfully' });
};
