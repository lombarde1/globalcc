// routes/auth.routes.js
import express from 'express';
import { 
  registerPlatform, 
  regenerateKeys, 
  listPlatforms,
  updatePlatformStatus,
  updateIpWhitelist
} from '../controllers/auth.controller.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de autenticação requerem acesso de administrador
router.post('/register', isAdmin, registerPlatform);
router.post('/regenerate-keys', isAdmin, regenerateKeys);
router.get('/platforms', isAdmin, listPlatforms);
router.put('/platforms/:id/status', isAdmin, updatePlatformStatus);
router.put('/platforms/:id/ip-whitelist', isAdmin, updateIpWhitelist);

export default router;