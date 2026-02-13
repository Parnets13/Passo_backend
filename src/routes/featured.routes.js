import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/requests', (req, res) => res.json({ success: true, message: 'Featured requests' }));
router.get('/active', (req, res) => res.json({ success: true, message: 'Active featured' }));

export default router;
