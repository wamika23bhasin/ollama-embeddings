import { Router } from 'express';
import {
  getAllCaseTasks,
  getCaseTaskById,
  createCaseTask,
  updateCaseTask,
  deleteCaseTask,
} from '../controllers/casetask.controller.js';

const router = Router();

router.get('/', getAllCaseTasks);
router.get('/:id', getCaseTaskById);
router.post('/', createCaseTask);
router.put('/:id', updateCaseTask);
router.delete('/:id', deleteCaseTask);

export default router;
