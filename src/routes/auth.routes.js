import express from 'express';
import { body } from 'express-validator';
import { login, register, getMe, logout, registerWorker, workerLogin } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const workerRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('category').custom((value) => {
    if (!value) {
      throw new Error('Category is required');
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new Error('At least one category is required');
      }
      return true;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return true;
    }
    throw new Error('Category must be a non-empty array or string');
  }),
  body('serviceArea').notEmpty().withMessage('Service area is required')
];

const workerLoginValidation = [
  body('mobile').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('password').notEmpty().withMessage('Password is required')
];

// Admin routes
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Worker routes
router.post('/worker/register', authLimiter, workerRegisterValidation, validate, registerWorker);
router.post('/worker/login', authLimiter, workerLoginValidation, validate, workerLogin);

export default router;
