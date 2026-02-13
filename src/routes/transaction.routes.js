import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', (req, res) => res.json({ success: true, message: 'Transactions' }));
router.get('/revenue', (req, res) => res.json({ success: true, message: 'Revenue reports' }));
router.post('/refund', (req, res) => res.json({ success: true, message: 'Refund issued' }));

export default router;
