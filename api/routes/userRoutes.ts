import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  loginUser 
} from '../controllers/userController';

const router = express.Router();

// Routes pour les utilisateurs
router.get('/', getAllUsers);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 