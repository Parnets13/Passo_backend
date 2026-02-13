import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('workerTypes').isArray({ min: 1 }).withMessage('At least one worker type is required')
];

// Public routes - no authentication required
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes - authentication required
router.post('/', protect, categoryValidation, validate, createCategory);
router.put('/:id', protect, categoryValidation, validate, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
