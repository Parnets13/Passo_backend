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

// All routes require authentication
router.use(protect);

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('workerTypes').isArray({ min: 1 }).withMessage('At least one worker type is required')
];

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', categoryValidation, validate, createCategory);
router.put('/:id', categoryValidation, validate, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
