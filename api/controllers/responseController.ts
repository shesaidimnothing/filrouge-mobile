import { Request, Response } from 'express';
import { prisma } from '../server';

// Récupérer toutes les réponses d'une annonce
export const getAdResponses = async (req: Request, res: Response) => {
  const { adId } = req.params;
  
  try {
    const responses = await prisma.response.findMany({
      where: {
        adId: parseInt(adId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(responses);
  } catch (error) {
    console.error(`Erreur lors de la récupération des réponses de l'annonce ${adId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
  }
};

// Récupérer une réponse par son ID
export const getResponseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const response = await prisma.response.findUnique({
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
        ad: true
      }
    });
    
    if (!response) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    res.json(response);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la réponse ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réponse' });
  }
};

// Créer une nouvelle réponse
export const createResponse = async (req: Request, res: Response) => {
  const { message, userId, adId } = req.body;
  
  // Validation des données
  if (!message || !userId || !adId) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    // Vérifier si l'annonce existe
    const ad = await prisma.ad.findUnique({
      where: {
        id: parseInt(adId)
      }
    });
    
    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Créer la réponse
    const newResponse = await prisma.response.create({
      data: {
        message,
        userId: parseInt(userId),
        adId: parseInt(adId)
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
    
    res.status(201).json(newResponse);
  } catch (error) {
    console.error('Erreur lors de la création de la réponse:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réponse' });
  }
};

// Supprimer une réponse
export const deleteResponse = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Vérifier si la réponse existe
    const existingResponse = await prisma.response.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingResponse) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    // Supprimer la réponse
    await prisma.response.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.json({ message: 'Réponse supprimée avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la réponse ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réponse' });
  }
};

// Récupérer les réponses d'un utilisateur
export const getUserResponses = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const responses = await prisma.response.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        ad: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(responses);
  } catch (error) {
    console.error(`Erreur lors de la récupération des réponses de l'utilisateur ${userId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réponses de l\'utilisateur' });
  }
}; 