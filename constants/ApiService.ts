import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Interface pour les annonces
export interface Annonce {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  date: string;
  image: string;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Interface pour les utilisateurs
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

// Interface pour les réponses aux annonces
export interface Response {
  id: number;
  content: string;
  adId: number;
  userId: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Interface pour les messages privés
export interface PrivateMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  read: boolean;
  status: string;
  sender?: {
    id: number;
    name: string;
    email: string;
  };
  receiver?: {
    id: number;
    name: string;
    email: string;
  };
}

// Données fictives pour les annonces (utilisées en cas d'erreur de connexion à la BD)
const MOCK_ANNONCES: Annonce[] = [
  {
    id: 1,
    title: 'iPhone 13 Pro Max - 256Go',
    price: 750,
    category: 'High-Tech',
    description: 'iPhone 13 Pro Max en excellent état, couleur graphite, 256Go de stockage. Livré avec chargeur et coque de protection.',
    date: '2023-05-15',
    image: 'https://via.placeholder.com/150',
    userId: 1,
    user: {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
  },
  {
    id: 2,
    title: 'Canapé d\'angle en cuir',
    price: 450,
    category: 'Maison',
    description: 'Canapé d\'angle en cuir véritable, couleur marron, très bon état. Dimensions: 250x200cm.',
    date: '2023-05-14',
    image: 'https://via.placeholder.com/150',
    userId: 1,
    user: {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
  },
  {
    id: 3,
    title: 'VTT Scott Scale 970',
    price: 680,
    category: 'Équipements sportifs',
    description: 'VTT Scott Scale 970, taille L, très bon état. Freins à disque hydrauliques, suspension avant.',
    date: '2023-05-13',
    image: 'https://via.placeholder.com/150',
    userId: 1,
    user: {
      id: 1,
      name: 'Admin',
      email: 'admin@example.com'
    }
  },
];

// Service pour les annonces
class AdService {
  // Vérifier si l'API est disponible
  private async isApiAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.log('API non disponible, utilisation du mode hors ligne');
      return false;
    }
  }

  // Récupérer toutes les annonces
  async getAllAds(): Promise<Annonce[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/ads`);
        return response.data;
      } else {
        return MOCK_ANNONCES;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return MOCK_ANNONCES;
    }
  }

  // Récupérer une annonce par son ID
  async getAdById(id: number): Promise<Annonce | null> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/ads/${id}`);
        return response.data;
      } else {
        return MOCK_ANNONCES.find(a => a.id === id) || null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      return MOCK_ANNONCES.find(a => a.id === id) || null;
    }
  }

  // Ajouter une nouvelle annonce
  async addAd(annonce: Omit<Annonce, 'id' | 'date' | 'userId'>): Promise<Annonce | null> {
    try {
      // Récupérer l'utilisateur courant
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) {
        console.error('Utilisateur non connecté');
        return null;
      }
      
      const user = JSON.parse(userJson);
      const isOnline = await this.isApiAvailable();
      
      // Préparer les données de l'annonce
      const newAd = {
        ...annonce,
        userId: user.id,
        date: new Date().toISOString()
      };
      
      if (isOnline) {
        console.log('Envoi de l\'annonce à l\'API:', newAd);
        const response = await axios.post(`${API_BASE_URL}/ads`, newAd);
        console.log('Réponse de l\'API:', response.data);
        return response.data;
      } else {
        // Mode hors ligne - simuler l'ajout d'une annonce
        const mockAd: Annonce = {
          id: Date.now(),
          title: annonce.title,
          description: annonce.description,
          price: annonce.price,
          category: annonce.category,
          date: new Date().toISOString(),
          image: annonce.image || 'https://via.placeholder.com/150',
          userId: user.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        };
        
        MOCK_ANNONCES.unshift(mockAd);
        return mockAd;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      return null;
    }
  }

  // Supprimer une annonce
  async deleteAd(id: number): Promise<boolean> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/ads/${id}`);
        return true;
      } else {
        // Mode hors ligne - simuler la suppression d'une annonce
        const initialLength = MOCK_ANNONCES.length;
        const index = MOCK_ANNONCES.findIndex(a => a.id === id);
        if (index !== -1) {
          MOCK_ANNONCES.splice(index, 1);
        }
        return MOCK_ANNONCES.length < initialLength;
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      return false;
    }
  }

  // Supprimer toutes les annonces (admin uniquement)
  async deleteAllAds(): Promise<boolean> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/ads/all`);
        return true;
      } else {
        // Mode hors ligne - simuler la suppression de toutes les annonces
        MOCK_ANNONCES.length = 0;
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les annonces:', error);
      return false;
    }
  }

  // Récupérer les annonces d'un utilisateur
  async getUserAds(userId: number): Promise<Annonce[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/ads/user/${userId}`);
        return response.data;
      } else {
        // Mode hors ligne - filtrer les annonces par utilisateur
        return MOCK_ANNONCES.filter(a => a.userId === userId);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de l'utilisateur ${userId}:`, error);
      return MOCK_ANNONCES.filter(a => a.userId === userId);
    }
  }
}

// Service pour les utilisateurs
class UserService {
  // Vérifier si l'API est disponible
  private async isApiAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.log('API non disponible, utilisation du mode hors ligne');
      return false;
    }
  }

  // Connexion d'un utilisateur
  async login(email: string, password: string): Promise<User | null> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        console.log(`Tentative de connexion avec l'API: ${email}`);
        const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
        
        if (response.data && response.data.user) {
          // Stocker l'utilisateur connecté
          await AsyncStorage.setItem('currentUser', JSON.stringify(response.data.user));
          console.log('Utilisateur connecté via API:', response.data.user);
          return response.data.user;
        }
        return null;
      } else {
        // Mode hors ligne - accepter uniquement admin@example.com/admin123
        if (email === 'admin@example.com' && password === 'admin123') {
          const user = {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com'
          };
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        }
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Essayer en mode hors ligne si l'API échoue
      if (email === 'admin@example.com' && password === 'admin123') {
        const user = {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com'
        };
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      return null;
    }
  }

  // Inscription d'un utilisateur
  async register(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.post(`${API_BASE_URL}/users`, user);
        return response.data;
      } else {
        // Mode hors ligne - simuler l'inscription (uniquement pour le développement)
        const newUser = {
          id: Date.now(),
          ...user
        };
        await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
        return newUser;
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return null;
    }
  }

  // Déconnexion
  async logout(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return false;
    }
  }

  // Récupérer l'utilisateur courant
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur courant:', error);
      return null;
    }
  }
}

// Service pour les réponses aux annonces
class ResponseService {
  // Vérifier si l'API est disponible
  private async isApiAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.log('API non disponible');
      return false;
    }
  }

  // Récupérer les réponses d'une annonce
  async getAdResponses(adId: number): Promise<Response[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/responses/ad/${adId}`);
        return response.data;
      } else {
        console.error('La récupération des réponses n\'est pas disponible en mode hors ligne');
        return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des réponses pour l'annonce ${adId}:`, error);
      return [];
    }
  }

  // Ajouter une réponse à une annonce
  async addResponse(response: Omit<Response, 'id' | 'createdAt' | 'user'>): Promise<Response | null> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const resp = await axios.post(`${API_BASE_URL}/responses`, response);
        return resp.data;
      } else {
        console.error('L\'ajout de réponses n\'est pas disponible en mode hors ligne');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      return null;
    }
  }

  // Supprimer une réponse
  async deleteResponse(id: number): Promise<boolean> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/responses/${id}`);
        return true;
      } else {
        console.error('La suppression de réponses n\'est pas disponible en mode hors ligne');
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de la réponse ${id}:`, error);
      return false;
    }
  }

  // Récupérer les réponses d'un utilisateur
  async getUserResponses(userId: number): Promise<Response[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/responses/user/${userId}`);
        return response.data;
      } else {
        console.error('La récupération des réponses par utilisateur n\'est pas disponible en mode hors ligne');
        return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des réponses de l'utilisateur ${userId}:`, error);
      return [];
    }
  }
}

// Service pour les messages privés
class MessageService {
  // Vérifier si l'API est disponible
  private async isApiAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.log('API non disponible');
      return false;
    }
  }

  // Récupérer les messages d'un utilisateur
  async getUserMessages(userId: number): Promise<PrivateMessage[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/messages/user/${userId}`);
        return response.data;
      } else {
        console.error('La récupération des messages n\'est pas disponible en mode hors ligne');
        return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages de l'utilisateur ${userId}:`, error);
      return [];
    }
  }

  // Récupérer les conversations d'un utilisateur
  async getUserConversations(userId: number): Promise<any[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/messages/conversations/${userId}`);
        return response.data;
      } else {
        console.error('La récupération des conversations n\'est pas disponible en mode hors ligne');
        return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des conversations de l'utilisateur ${userId}:`, error);
      return [];
    }
  }

  // Récupérer une conversation spécifique
  async getConversation(userId1: number, userId2: number): Promise<PrivateMessage[]> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/messages/conversation/${userId1}/${userId2}`);
        return response.data;
      } else {
        console.error('La récupération de la conversation n\'est pas disponible en mode hors ligne');
        return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la conversation entre ${userId1} et ${userId2}:`, error);
      return [];
    }
  }

  // Envoyer un message
  async sendMessage(message: Omit<PrivateMessage, 'id' | 'createdAt' | 'read' | 'status' | 'sender' | 'receiver'>): Promise<PrivateMessage | null> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        const response = await axios.post(`${API_BASE_URL}/messages`, message);
        return response.data;
      } else {
        console.error('L\'envoi de messages n\'est pas disponible en mode hors ligne');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: number): Promise<boolean> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        await axios.patch(`${API_BASE_URL}/messages/${messageId}/read`);
        return true;
      } else {
        console.error('Le marquage des messages n\'est pas disponible en mode hors ligne');
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors du marquage du message ${messageId} comme lu:`, error);
      return false;
    }
  }

  // Marquer tous les messages d'une conversation comme lus
  async markConversationAsRead(userId1: number, userId2: number): Promise<boolean> {
    try {
      const isOnline = await this.isApiAvailable();
      
      if (isOnline) {
        await axios.patch(`${API_BASE_URL}/messages/conversation/${userId1}/${userId2}/read`);
        return true;
      } else {
        console.error('Le marquage des conversations n\'est pas disponible en mode hors ligne');
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors du marquage de la conversation entre ${userId1} et ${userId2} comme lue:`, error);
      return false;
    }
  }
}

// Exporter les services
export const adService = new AdService();
export const userService = new UserService();
export const responseService = new ResponseService();
export const messageService = new MessageService(); 