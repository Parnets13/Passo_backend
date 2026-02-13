import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Placeholder - implement controllers as needed
router.get('/', (req, res) => res.json({ success: true, message: 'Pricing routes' }));

export default router;
