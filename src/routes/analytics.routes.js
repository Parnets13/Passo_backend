import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/unlocks-by-category', (req, res) => res.json({ success: true, message: 'Unlocks by category' }));
router.get('/workers-by-city', (req, res) => res.json({ success: true, message: 'Workers by city' }));
router.get('/conversion-rate', (req, res) => res.json({ success: true, message: 'Conversion rate' }));
router.get('/export', (req, res) => res.json({ success: true, message: 'Export analytics' }));

export default router;
