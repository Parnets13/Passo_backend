import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', (req, res) => res.json({ success: true, message: 'Complaints' }));
router.post('/:id/warn', (req, res) => res.json({ success: true, message: 'Warning issued' }));
router.post('/:id/refund', (req, res) => res.json({ success: true, message: 'Refund issued' }));
router.post('/:id/resolve', (req, res) => res.json({ success: true, message: 'Complaint resolved' }));

export default router;
