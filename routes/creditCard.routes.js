// routes/creditCard.routes.js
import express from 'express';
import { 
  generateCreditCard, 
  validateCreditCard, 
  processPayment,
  getCardStats
} from '../controllers/creditCard.controller.js';

const router = express.Router();

// Rotas públicas
router.post('/generate', generateCreditCard);
router.post('/validate', validateCreditCard);
router.post('/process-payment', processPayment);
router.get('/stats', getCardStats);

export default router;