// Service pour communiquer avec l'API
const API_URL = 'http://localhost:3000/api';

// Types pour les annonces
export interface Annonce {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  imageUrl?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Types pour les utilisateurs
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les réponses
export interface Response {
  id: number;
  message: string;
  userId: number;
  adId: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Types pour les messages privés
export interface PrivateMessage {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  status: string;
  senderId: number;
  receiverId: number;
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

// Service pour les annonces
export const adService = {
  // Récupérer toutes les annonces
  getAllAds: async (): Promise<Annonce[]> => {
    try {
      const response = await fetch(`${API_URL}/ads`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des annonces');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return [];
    }
  },

  // Récupérer une annonce par son ID
  getAdById: async (id: number): Promise<Annonce | null> => {
    try {
      const response = await fetch(`${API_URL}/ads/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'annonce');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      return null;
    }
  },

  // Créer une nouvelle annonce
  createAd: async (ad: Omit<Annonce, 'id' | 'createdAt' | 'updatedAt'>): Promise<Annonce | null> => {
    try {
      const response = await fetch(`${API_URL}/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ad)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'annonce');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      return null;
    }
  },

  // Mettre à jour une annonce
  updateAd: async (id: number, ad: Partial<Annonce>): Promise<Annonce | null> => {
    try {
      const response = await fetch(`${API_URL}/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ad)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'annonce');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'annonce ${id}:`, error);
      return null;
    }
  },

  // Supprimer une annonce
  deleteAd: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/ads/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'annonce');
      }
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      return false;
    }
  },

  // Récupérer les annonces d'un utilisateur
  getUserAds: async (userId: number): Promise<Annonce[]> => {
    try {
      const response = await fetch(`${API_URL}/ads/user/${userId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des annonces de l\'utilisateur');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de l'utilisateur ${userId}:`, error);
      return [];
    }
  },

  // Supprimer toutes les annonces
  deleteAllAds: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/ads/admin/delete-all`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de toutes les annonces');
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les annonces:', error);
      return false;
    }
  }
};

// Service pour les utilisateurs
export const userService = {
  // Connexion d'un utilisateur
  login: async (email: string, password: string): Promise<{ user: User } | null> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la connexion');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return null;
    }
  },

  // Créer un nouvel utilisateur
  register: async (user: { email: string, password: string, name: string }): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return null;
    }
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (id: number): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      return null;
    }
  }
};

// Service pour les réponses aux annonces
export const responseService = {
  // Récupérer les réponses d'une annonce
  getAdResponses: async (adId: number): Promise<Response[]> => {
    try {
      const response = await fetch(`${API_URL}/responses/ad/${adId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réponses');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des réponses de l'annonce ${adId}:`, error);
      return [];
    }
  },

  // Créer une nouvelle réponse
  createResponse: async (responseData: { message: string, userId: number, adId: number }): Promise<Response | null> => {
    try {
      const response = await fetch(`${API_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la réponse');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la réponse:', error);
      return null;
    }
  },

  // Supprimer une réponse
  deleteResponse: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/responses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la réponse');
      }
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la réponse ${id}:`, error);
      return false;
    }
  }
};

// Service pour les messages privés
export const messageService = {
  // Récupérer les conversations d'un utilisateur
  getUserConversations: async (userId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${API_URL}/messages/conversations/${userId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des conversations de l'utilisateur ${userId}:`, error);
      return [];
    }
  },

  // Récupérer les messages d'une conversation
  getConversation: async (userId: number, contactId: number): Promise<PrivateMessage[]> => {
    try {
      const response = await fetch(`${API_URL}/messages/conversation/${userId}/${contactId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la conversation');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la conversation entre ${userId} et ${contactId}:`, error);
      return [];
    }
  },

  // Envoyer un message
  sendMessage: async (message: { content: string, senderId: number, receiverId: number }): Promise<PrivateMessage | null> => {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  },

  // Marquer un message comme lu
  markMessageAsRead: async (id: number): Promise<PrivateMessage | null> => {
    try {
      const response = await fetch(`${API_URL}/messages/read/${id}`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Erreur lors du marquage du message comme lu');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors du marquage du message ${id} comme lu:`, error);
      return null;
    }
  },

  // Marquer tous les messages d'une conversation comme lus
  markConversationAsRead: async (userId: number, contactId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/messages/read-conversation/${userId}/${contactId}`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Erreur lors du marquage des messages comme lus');
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      return false;
    }
  }
}; 