import { PrismaClient } from '@prisma/client';

// Créer une instance du client Prisma
const prisma = new PrismaClient();

// Types pour les annonces
export interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  imageUrl?: string | null;
}

// Types pour les utilisateurs
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les réponses
export interface Response {
  id: number;
  message: string;
  userId: number;
  adId: number;
  createdAt: Date;
}

// Types pour les messages privés
export interface PrivateMessage {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
  status: string;
  senderId: number;
  receiverId: number;
}

class PrismaService {
  // Récupérer toutes les annonces
  async getAllAds(): Promise<Ad[]> {
    try {
      const ads = await prisma.ad.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return ads;
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return [];
    }
  }

  // Récupérer une annonce par son ID
  async getAdById(id: number): Promise<Ad | null> {
    try {
      const ad = await prisma.ad.findUnique({
        where: {
          id: id
        },
        include: {
          user: true,
          responses: {
            include: {
              user: true
            }
          }
        }
      });
      return ad;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      return null;
    }
  }

  // Ajouter une nouvelle annonce
  async addAd(ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ad | null> {
    try {
      const newAd = await prisma.ad.create({
        data: {
          title: ad.title,
          description: ad.description,
          price: ad.price,
          category: ad.category,
          userId: ad.userId,
          imageUrl: ad.imageUrl || null
        }
      });
      return newAd;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      return null;
    }
  }

  // Supprimer une annonce
  async deleteAd(id: number): Promise<boolean> {
    try {
      // Supprimer d'abord les réponses associées
      await prisma.response.deleteMany({
        where: {
          adId: id
        }
      });
      
      // Puis supprimer l'annonce
      await prisma.ad.delete({
        where: {
          id: id
        }
      });
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      return false;
    }
  }

  // Vérifier les identifiants de connexion
  async verifyLogin(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
      
      if (user && user.password === password) {
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification des identifiants:', error);
      return null;
    }
  }

  // Créer un nouvel utilisateur
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name
        }
      });
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return null;
    }
  }

  // Récupérer les annonces d'un utilisateur
  async getUserAds(userId: number): Promise<Ad[]> {
    try {
      const ads = await prisma.ad.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return ads;
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de l'utilisateur ${userId}:`, error);
      return [];
    }
  }

  // Ajouter une réponse à une annonce
  async addResponse(response: Omit<Response, 'id' | 'createdAt'>): Promise<Response | null> {
    try {
      const newResponse = await prisma.response.create({
        data: {
          message: response.message,
          userId: response.userId,
          adId: response.adId
        }
      });
      return newResponse;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      return null;
    }
  }

  // Envoyer un message privé
  async sendPrivateMessage(message: Omit<PrivateMessage, 'id' | 'createdAt' | 'updatedAt' | 'read' | 'status'>): Promise<PrivateMessage | null> {
    try {
      const newMessage = await prisma.privateMessage.create({
        data: {
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId
        }
      });
      return newMessage;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message privé:', error);
      return null;
    }
  }

  // Récupérer les messages privés d'un utilisateur
  async getUserMessages(userId: number): Promise<PrivateMessage[]> {
    try {
      const messages = await prisma.privateMessage.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: true,
          receiver: true
        }
      });
      return messages;
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages de l'utilisateur ${userId}:`, error);
      return [];
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: number): Promise<boolean> {
    try {
      await prisma.privateMessage.update({
        where: {
          id: messageId
        },
        data: {
          read: true,
          status: 'read'
        }
      });
      return true;
    } catch (error) {
      console.error(`Erreur lors du marquage du message ${messageId} comme lu:`, error);
      return false;
    }
  }

  // Initialiser la base de données avec un utilisateur admin
  async initializeDatabase(): Promise<void> {
    try {
      // Vérifier si l'utilisateur admin existe déjà
      const adminExists = await prisma.user.findUnique({
        where: {
          email: 'admin@example.com'
        }
      });
      
      // Créer l'utilisateur admin s'il n'existe pas
      if (!adminExists) {
        await prisma.user.create({
          data: {
            email: 'admin@example.com',
            password: 'admin123',
            name: 'Administrateur'
          }
        });
        console.log('Utilisateur admin créé avec succès');
      }
      
      console.log('Base de données initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
  }
}

// Exporter une instance unique du service
export const prismaService = new PrismaService();

// Initialiser la base de données au démarrage
prismaService.initializeDatabase().catch(console.error); 