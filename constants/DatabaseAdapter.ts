import AsyncStorage from '@react-native-async-storage/async-storage';
import { prismaService, Ad as PrismaAd, User as PrismaUser } from './PrismaService';

// Types pour les annonces (compatible avec l'interface existante)
export interface Annonce {
  id: string;
  title: string;
  price: string;
  category: string;
  description: string;
  date: string;
  image: string;
  userId: string;
  userName?: string;
}

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  name: string;
}

// Données fictives pour les annonces (utilisées en cas d'erreur de connexion à la BD)
const MOCK_ANNONCES: Annonce[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro Max - 256Go',
    price: '750',
    category: 'High-Tech',
    description: 'iPhone 13 Pro Max en excellent état, couleur graphite, 256Go de stockage. Livré avec chargeur et coque de protection.',
    date: '2023-05-15',
    image: 'https://via.placeholder.com/150',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '2',
    title: 'Canapé d\'angle en cuir',
    price: '450',
    category: 'Maison',
    description: 'Canapé d\'angle en cuir véritable, couleur marron, très bon état. Dimensions: 250x200cm.',
    date: '2023-05-14',
    image: 'https://via.placeholder.com/150',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '3',
    title: 'VTT Scott Scale 970',
    price: '680',
    category: 'Équipements sportifs',
    description: 'VTT Scott Scale 970, taille L, très bon état. Freins à disque hydrauliques, suspension avant.',
    date: '2023-05-13',
    image: 'https://via.placeholder.com/150',
    userId: '2',
    userName: 'Jane Smith'
  },
];

// Convertir une annonce Prisma en annonce compatible avec l'interface existante
function convertPrismaAd(prismaAd: PrismaAd, userName?: string): Annonce {
  return {
    id: prismaAd.id.toString(),
    title: prismaAd.title,
    price: prismaAd.price.toString(),
    category: prismaAd.category,
    description: prismaAd.description,
    date: prismaAd.createdAt.toISOString(),
    image: prismaAd.imageUrl || 'https://via.placeholder.com/150',
    userId: prismaAd.userId.toString(),
    userName: userName
  };
}

// Convertir un utilisateur Prisma en utilisateur compatible avec l'interface existante
function convertPrismaUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id.toString(),
    email: prismaUser.email,
    name: prismaUser.name
  };
}

class DatabaseAdapter {
  private mockData: Annonce[];
  private useOfflineMode: boolean;
  private currentUser: User | null = null;

  constructor() {
    this.mockData = [...MOCK_ANNONCES];
    this.useOfflineMode = false;
    this.checkConnectivity();
  }

  // Vérifier la connectivité à la base de données
  private async checkConnectivity(): Promise<void> {
    try {
      // Essayer de récupérer les annonces pour vérifier la connectivité
      await prismaService.getAllAds();
      this.useOfflineMode = false;
      console.log('Mode en ligne: Utilisation de la base de données PostgreSQL');
    } catch (error) {
      this.useOfflineMode = true;
      console.warn('Mode hors ligne: Utilisation des données locales');
    }
  }

  // Récupérer toutes les annonces
  async getAllAnnonces(): Promise<Annonce[]> {
    try {
      if (this.useOfflineMode) {
        return this.mockData;
      }

      const prismaAds = await prismaService.getAllAds();
      
      // Pour chaque annonce, récupérer le nom de l'utilisateur
      const annonces: Annonce[] = [];
      for (const ad of prismaAds) {
        const user = await prismaService.verifyLogin(ad.userId.toString(), '');
        const userName = user ? user.name : 'Utilisateur inconnu';
        annonces.push(convertPrismaAd(ad, userName));
      }
      
      return annonces;
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return this.mockData;
    }
  }

  // Récupérer une annonce par son ID
  async getAnnonceById(id: string): Promise<Annonce | null> {
    try {
      if (this.useOfflineMode) {
        const annonce = this.mockData.find(a => a.id === id);
        return annonce || null;
      }

      const prismaAd = await prismaService.getAdById(parseInt(id));
      if (!prismaAd) return null;
      
      // Récupérer le nom de l'utilisateur
      const user = await prismaService.verifyLogin(prismaAd.userId.toString(), '');
      const userName = user ? user.name : 'Utilisateur inconnu';
      
      return convertPrismaAd(prismaAd, userName);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      const annonce = this.mockData.find(a => a.id === id);
      return annonce || null;
    }
  }

  // Ajouter une nouvelle annonce
  async addAnnonce(annonce: Omit<Annonce, 'id' | 'date' | 'userId' | 'userName'>): Promise<Annonce | null> {
    try {
      if (!this.currentUser) {
        throw new Error('Utilisateur non connecté');
      }
      
      if (this.useOfflineMode) {
        const newAnnonce: Annonce = {
          ...annonce,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          image: annonce.image || 'https://via.placeholder.com/150',
          userId: this.currentUser.id,
          userName: this.currentUser.name
        };
        this.mockData.unshift(newAnnonce);
        return newAnnonce;
      }

      const prismaAd = await prismaService.addAd({
        title: annonce.title,
        description: annonce.description,
        price: parseFloat(annonce.price),
        category: annonce.category,
        userId: parseInt(this.currentUser.id),
        imageUrl: annonce.image
      });

      if (!prismaAd) return null;
      
      return convertPrismaAd(prismaAd, this.currentUser.name);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      
      // Fallback aux données locales si l'utilisateur est connecté
      if (this.currentUser) {
        const newAnnonce: Annonce = {
          ...annonce,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          image: annonce.image || 'https://via.placeholder.com/150',
          userId: this.currentUser.id,
          userName: this.currentUser.name
        };
        this.mockData.unshift(newAnnonce);
        return newAnnonce;
      }
      
      return null;
    }
  }

  // Supprimer une annonce
  async deleteAnnonce(id: string): Promise<boolean> {
    try {
      if (this.useOfflineMode) {
        const initialLength = this.mockData.length;
        this.mockData = this.mockData.filter(a => a.id !== id);
        return this.mockData.length < initialLength;
      }

      return await prismaService.deleteAd(parseInt(id));
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      
      // Fallback aux données locales
      const initialLength = this.mockData.length;
      this.mockData = this.mockData.filter(a => a.id !== id);
      return this.mockData.length < initialLength;
    }
  }

  // Vérifier les identifiants de connexion
  async verifyLogin(email: string, password: string): Promise<User | null> {
    try {
      if (this.useOfflineMode) {
        // Pour simplifier, on accepte toujours admin@example.com/admin123 en mode hors ligne
        if (email === 'admin@example.com' && password === 'admin123') {
          const user: User = {
            id: '1',
            email: 'admin@example.com',
            name: 'Administrateur'
          };
          this.currentUser = user;
          return user;
        }
        return null;
      }

      const user = await prismaService.verifyLogin(email, password);
      if (user) {
        const convertedUser = convertPrismaUser(user);
        this.currentUser = convertedUser;
        return convertedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification des identifiants:', error);
      
      // Fallback à l'authentification locale
      if (email === 'admin@example.com' && password === 'admin123') {
        const user: User = {
          id: '1',
          email: 'admin@example.com',
          name: 'Administrateur'
        };
        this.currentUser = user;
        return user;
      }
      
      return null;
    }
  }

  // Créer un nouvel utilisateur
  async createUser(email: string, password: string, name: string): Promise<User | null> {
    try {
      if (this.useOfflineMode) {
        // En mode hors ligne, on simule la création d'un utilisateur
        const user: User = {
          id: Date.now().toString(),
          email,
          name
        };
        this.currentUser = user;
        return user;
      }

      const newUser = await prismaService.createUser({
        email,
        password,
        name
      });
      
      if (newUser) {
        const convertedUser = convertPrismaUser(newUser);
        this.currentUser = convertedUser;
        return convertedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return null;
    }
  }

  // Déconnexion
  logout(): void {
    this.currentUser = null;
  }

  // Récupérer l'utilisateur actuellement connecté
  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Exporter une instance unique du service
export const dbService = new DatabaseAdapter(); 