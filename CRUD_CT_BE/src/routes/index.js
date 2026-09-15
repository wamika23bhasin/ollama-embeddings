import { Router } from 'express';
import caseTaskRouter from './casetask.routes.js';

const router = Router();

router.use('/casetasks', caseTaskRouter);

// Register additional resource routes here:
// router.use('/posts', postRouter);

export default router;
