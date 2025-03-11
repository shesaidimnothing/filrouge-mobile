import express from 'express';
import { 
  getUserMessages, 
  getUserConversations, 
  getConversation, 
  sendMessage, 
  markMessageAsRead, 
  markConversationAsRead 
} from '../controllers/messageController';

const router = express.Router();

// Routes pour les messages privés
router.get('/user/:userId', getUserMessages);
router.get('/conversations/:userId', getUserConversations);
router.get('/conversation/:userId/:contactId', getConversation);
router.post('/', sendMessage);
router.put('/read/:id', markMessageAsRead);
router.put('/read-conversation/:userId/:contactId', markConversationAsRead);

export default router; 