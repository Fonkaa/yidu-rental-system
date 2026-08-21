import express from 'express';
import { initiatePayment, chapaWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/payments/initiate', initiatePayment);
router.post('/payments/webhook', chapaWebhook); // Chapa calls this route automatically

export default router;