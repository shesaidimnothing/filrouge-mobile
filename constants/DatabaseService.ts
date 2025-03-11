import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour les annonces
export interface Annonce {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  date: string;
  image: string;
  description?: string;
  is_hidden?: boolean;
}

// Données fictives pour les annonces
const MOCK_ANNONCES: Annonce[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro Max - 256Go',
    price: '750 €',
    category: 'High-Tech',
    location: 'Paris',
    date: '2023-05-15',
    image: 'https://via.placeholder.com/150',
    description: 'iPhone 13 Pro Max en excellent état, couleur graphite, 256Go de stockage. Livré avec chargeur et coque de protection.',
    is_hidden: false
  },
  {
    id: '2',
    title: 'Canapé d\'angle en cuir',
    price: '450 €',
    category: 'Maison',
    location: 'Lyon',
    date: '2023-05-14',
    image: 'https://via.placeholder.com/150',
    description: 'Canapé d\'angle en cuir véritable, couleur marron, très bon état. Dimensions: 250x200cm.',
    is_hidden: false
  },
  {
    id: '3',
    title: 'VTT Scott Scale 970',
    price: '680 €',
    category: 'Équipements sportifs',
    location: 'Marseille',
    date: '2023-05-13',
    image: 'https://via.placeholder.com/150',
    description: 'VTT Scott Scale 970, taille L, très bon état. Freins à disque hydrauliques, suspension avant.',
    is_hidden: false
  },
];

// Clés pour AsyncStorage
const STORAGE_KEYS = {
  ANNONCES: 'annonces',
  USER: 'user',
};

class DatabaseService {
  private mockData: Annonce[];
  private initialized: boolean = false;

  constructor() {
    this.mockData = [...MOCK_ANNONCES];
    this.initializeStorage();
  }

  // Initialiser le stockage avec des données fictives si nécessaire
  private async initializeStorage() {
    try {
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      
      if (!storedAnnonces) {
        // Aucune donnée stockée, initialiser avec les données fictives
        await AsyncStorage.setItem(STORAGE_KEYS.ANNONCES, JSON.stringify(this.mockData));
        console.log('Stockage initialisé avec des données fictives');
      } else {
        // Charger les données stockées
        this.mockData = JSON.parse(storedAnnonces);
        console.log('Données chargées depuis le stockage');
      }
      
      // Créer l'utilisateur admin s'il n'existe pas
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (!storedUser) {
        const adminUser = { username: 'admin', password: 'admin123', isAdmin: true };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
        console.log('Utilisateur admin créé');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stockage:', error);
    }
  }

  // Récupérer toutes les annonces visibles
  async getAllAnnonces(): Promise<Annonce[]> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      if (storedAnnonces) {
        const annonces: Annonce[] = JSON.parse(storedAnnonces);
        return annonces.filter(a => !a.is_hidden);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
    }
    
    return this.mockData.filter(a => !a.is_hidden);
  }

  // Récupérer toutes les annonces (y compris masquées) pour l'admin
  async getAllAnnoncesAdmin(): Promise<Annonce[]> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      if (storedAnnonces) {
        return JSON.parse(storedAnnonces);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces admin:', error);
    }
    
    return this.mockData;
  }

  // Récupérer une annonce par son ID
  async getAnnonceById(id: string): Promise<Annonce | null> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      if (storedAnnonces) {
        const annonces: Annonce[] = JSON.parse(storedAnnonces);
        const annonce = annonces.find(a => a.id === id);
        return annonce || null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
    }
    
    const annonce = this.mockData.find(a => a.id === id);
    return annonce || null;
  }

  // Ajouter une nouvelle annonce
  async addAnnonce(annonce: Omit<Annonce, 'id'>): Promise<Annonce | null> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const newAnnonce: Annonce = {
        ...annonce,
        id: Date.now().toString(),
        date: annonce.date || new Date().toISOString(),
        is_hidden: annonce.is_hidden || false
      };
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      let annonces: Annonce[] = storedAnnonces ? JSON.parse(storedAnnonces) : [];
      
      // Ajouter la nouvelle annonce
      annonces.unshift(newAnnonce);
      
      // Sauvegarder les annonces
      await AsyncStorage.setItem(STORAGE_KEYS.ANNONCES, JSON.stringify(annonces));
      
      // Mettre à jour les données locales
      this.mockData = annonces;
      
      return newAnnonce;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      
      // Fallback aux données locales
      const newAnnonce: Annonce = {
        ...annonce,
        id: Date.now().toString(),
        date: annonce.date || new Date().toISOString(),
        is_hidden: annonce.is_hidden || false
      };
      this.mockData.unshift(newAnnonce);
      return newAnnonce;
    }
  }

  // Supprimer une annonce
  async deleteAnnonce(id: string): Promise<boolean> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      if (storedAnnonces) {
        let annonces: Annonce[] = JSON.parse(storedAnnonces);
        const initialLength = annonces.length;
        
        // Filtrer l'annonce à supprimer
        annonces = annonces.filter(a => a.id !== id);
        
        // Sauvegarder les annonces
        await AsyncStorage.setItem(STORAGE_KEYS.ANNONCES, JSON.stringify(annonces));
        
        // Mettre à jour les données locales
        this.mockData = annonces;
        
        return annonces.length < initialLength;
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
    }
    
    // Fallback aux données locales
    const initialLength = this.mockData.length;
    this.mockData = this.mockData.filter(a => a.id !== id);
    return this.mockData.length < initialLength;
  }

  // Masquer/démasquer une annonce
  async toggleAnnonceVisibility(id: string, isHidden: boolean): Promise<boolean> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      const storedAnnonces = await AsyncStorage.getItem(STORAGE_KEYS.ANNONCES);
      if (storedAnnonces) {
        let annonces: Annonce[] = JSON.parse(storedAnnonces);
        
        // Trouver l'annonce à modifier
        const annonceIndex = annonces.findIndex(a => a.id === id);
        if (annonceIndex !== -1) {
          // Modifier la visibilité
          annonces[annonceIndex].is_hidden = isHidden;
          
          // Sauvegarder les annonces
          await AsyncStorage.setItem(STORAGE_KEYS.ANNONCES, JSON.stringify(annonces));
          
          // Mettre à jour les données locales
          this.mockData = annonces;
          
          return true;
        }
      }
    } catch (error) {
      console.error(`Erreur lors du changement de visibilité de l'annonce ${id}:`, error);
    }
    
    // Fallback aux données locales
    const annonce = this.mockData.find(a => a.id === id);
    if (annonce) {
      annonce.is_hidden = isHidden;
      return true;
    }
    return false;
  }

  // Vérifier les identifiants de connexion
  async verifyLogin(username: string, password: string): Promise<boolean> {
    try {
      // Attendre l'initialisation si nécessaire
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      // Pour simplifier, on accepte toujours admin/admin123
      if (username === 'admin' && password === 'admin123') {
        return true;
      }
      
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.username === username && user.password === password;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des identifiants:', error);
    }
    
    return false;
  }

  // Attendre l'initialisation du stockage
  private async waitForInitialization(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkInitialized = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      checkInitialized();
    });
  }
}

// Exporter une instance unique du service
export const dbService = new DatabaseService(); 