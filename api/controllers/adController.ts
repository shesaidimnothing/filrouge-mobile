import { Request, Response } from 'express';
import { prisma } from '../server';

// Récupérer toutes les annonces
export const getAllAds = async (req: Request, res: Response) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json(ads);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
};

// Récupérer une annonce par son ID
export const getAdById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const ad = await prisma.ad.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    res.json(ad);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'annonce' });
  }
};

// Créer une nouvelle annonce
export const createAd = async (req: Request, res: Response) => {
  const { title, description, price, category, userId, imageUrl } = req.body;
  
  // Validation des données
  if (!title || !description || !price || !category || !userId) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    const newAd = await prisma.ad.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        userId: parseInt(userId),
        imageUrl: imageUrl || null
      }
    });
    
    res.status(201).json(newAd);
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'annonce' });
  }
};

// Mettre à jour une annonce
export const updateAd = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, price, category, imageUrl } = req.body;
  
  try {
    // Vérifier si l'annonce existe
    const existingAd = await prisma.ad.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingAd) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    // Mettre à jour l'annonce
    const updatedAd = await prisma.ad.update({
      where: {
        id: parseInt(id)
      },
      data: {
        title: title || existingAd.title,
        description: description || existingAd.description,
        price: price ? parseFloat(price) : existingAd.price,
        category: category || existingAd.category,
        imageUrl: imageUrl !== undefined ? imageUrl : existingAd.imageUrl
      }
    });
    
    res.json(updatedAd);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'annonce ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce' });
  }
};

// Supprimer une annonce
export const deleteAd = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'annonce existe
    const existingAd = await prisma.ad.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingAd) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    // Supprimer d'abord les réponses associées
    await prisma.response.deleteMany({
      where: {
        adId: parseInt(id)
      }
    });
    
    // Puis supprimer l'annonce
    await prisma.ad.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce' });
  }
};

// Récupérer les annonces d'un utilisateur
export const getUserAds = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const ads = await prisma.ad.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json(ads);
  } catch (error) {
    console.error(`Erreur lors de la récupération des annonces de l'utilisateur ${userId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces de l\'utilisateur' });
  }
};

// Supprimer toutes les annonces
export const deleteAllAds = async (req: Request, res: Response) => {
  try {
    // Supprimer d'abord toutes les réponses
    await prisma.response.deleteMany({});
    
    // Puis supprimer toutes les annonces
    await prisma.ad.deleteMany({});
    
    res.json({ message: 'Toutes les annonces ont été supprimées avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les annonces:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de toutes les annonces' });
  }
}; 