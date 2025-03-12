import express from 'express';
import { 
  getAllAds, 
  getAdById, 
  createAd, 
  updateAd, 
  deleteAd, 
  getUserAds,
  deleteAllAds
} from '../controllers/adController';

const router = express.Router();

// Routes pour les annonces
router.get('/', getAllAds);
router.delete('/admin/delete-all', deleteAllAds);
router.get('/user/:userId', getUserAds);
router.get('/:id', getAdById);
router.post('/', createAd);
router.put('/:id', updateAd);
router.delete('/:id', deleteAd);

export default router; 