import express from 'express';
import { 
  getAdResponses, 
  getResponseById, 
  createResponse, 
  deleteResponse, 
  getUserResponses 
} from '../controllers/responseController';

const router = express.Router();

// Routes pour les réponses
router.get('/ad/:adId', getAdResponses);
router.get('/:id', getResponseById);
router.post('/', createResponse);
router.delete('/:id', deleteResponse);
router.get('/user/:userId', getUserResponses);

export default router; 