import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  blockUser,
  unblockUser,
  issueCredits,
  getUserHistory
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

const creditValidation = [
  body('credits').isInt({ min: 1 }).withMessage('Credits must be a positive integer'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/:id/block', blockUser);
router.post('/:id/unblock', unblockUser);
router.post('/:id/credits', creditValidation, validate, issueCredits);
router.get('/:id/history', getUserHistory);

export default router;
