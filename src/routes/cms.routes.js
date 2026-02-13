import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/:type', (req, res) => res.json({ success: true, message: 'CMS content' }));
router.put('/:type', (req, res) => res.json({ success: true, message: 'Content updated' }));

export default router;
