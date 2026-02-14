import express from 'express';
import { body } from 'express-validator';
import { login, register, getMe, logout, registerWorker, workerLogin, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
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
  body('category').notEmpty().withMessage('Category is required'),
  body('serviceArea').notEmpty().withMessage('Service area is required')
];

const workerLoginValidation = [
  body('mobile').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('resetToken').notEmpty().withMessage('Reset code is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Admin routes
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, resetPassword);

// Worker routes
router.post('/worker/register', authLimiter, workerRegisterValidation, validate, registerWorker);
router.post('/worker/login', authLimiter, workerLoginValidation, validate, workerLogin);

export default router;
