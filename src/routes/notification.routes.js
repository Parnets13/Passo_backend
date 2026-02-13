import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/send', (req, res) => res.json({ success: true, message: 'Notification sent' }));
router.get('/history', (req, res) => res.json({ success: true, message: 'Notification history' }));
router.post('/banner', (req, res) => res.json({ success: true, message: 'Banner uploaded' }));
router.get('/banners', (req, res) => res.json({ success: true, message: 'Banners list' }));

export default router;
