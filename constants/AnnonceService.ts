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
    description: 'iPhone 13 Pro Max en excellent état, couleur graphite, 256Go de stockage. Livré avec chargeur et coque de protection.'
  },
  {
    id: '2',
    title: 'Canapé d\'angle en cuir',
    price: '450 €',
    category: 'Maison',
    location: 'Lyon',
    date: '2023-05-14',
    image: 'https://via.placeholder.com/150',
    description: 'Canapé d\'angle en cuir véritable, couleur marron, très bon état. Dimensions: 250x200cm.'
  },
  {
    id: '3',
    title: 'VTT Scott Scale 970',
    price: '680 €',
    category: 'Équipements sportifs',
    location: 'Marseille',
    date: '2023-05-13',
    image: 'https://via.placeholder.com/150',
    description: 'VTT Scott Scale 970, taille L, très bon état. Freins à disque hydrauliques, suspension avant.'
  },
];

// Dans une vraie application, ces fonctions feraient des appels API à un backend
class AnnonceService {
  private annonces: Annonce[] = [...MOCK_ANNONCES];

  // Récupérer toutes les annonces
  getAllAnnonces(): Promise<Annonce[]> {
    return Promise.resolve([...this.annonces]);
  }

  // Récupérer une annonce par son ID
  getAnnonceById(id: string): Promise<Annonce | undefined> {
    const annonce = this.annonces.find(a => a.id === id);
    return Promise.resolve(annonce);
  }

  // Récupérer les annonces par catégorie
  getAnnoncesByCategory(category: string): Promise<Annonce[]> {
    const filteredAnnonces = this.annonces.filter(a => a.category === category);
    return Promise.resolve(filteredAnnonces);
  }

  // Ajouter une nouvelle annonce
  addAnnonce(annonce: Omit<Annonce, 'id' | 'date'>): Promise<Annonce> {
    const newAnnonce: Annonce = {
      ...annonce,
      id: Date.now().toString(), // Génère un ID unique basé sur le timestamp
      date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    };
    
    this.annonces.unshift(newAnnonce); // Ajoute au début du tableau
    return Promise.resolve(newAnnonce);
  }

  // Mettre à jour une annonce
  updateAnnonce(id: string, updates: Partial<Annonce>): Promise<Annonce | undefined> {
    const index = this.annonces.findIndex(a => a.id === id);
    
    if (index === -1) {
      return Promise.resolve(undefined);
    }
    
    const updatedAnnonce = {
      ...this.annonces[index],
      ...updates,
    };
    
    this.annonces[index] = updatedAnnonce;
    return Promise.resolve(updatedAnnonce);
  }

  // Supprimer une annonce
  deleteAnnonce(id: string): Promise<boolean> {
    const initialLength = this.annonces.length;
    this.annonces = this.annonces.filter(a => a.id !== id);
    
    return Promise.resolve(this.annonces.length < initialLength);
  }

  // Rechercher des annonces
  searchAnnonces(query: string): Promise<Annonce[]> {
    const lowercaseQuery = query.toLowerCase();
    
    const results = this.annonces.filter(a => 
      a.title.toLowerCase().includes(lowercaseQuery) ||
      a.description?.toLowerCase().includes(lowercaseQuery) ||
      a.category.toLowerCase().includes(lowercaseQuery) ||
      a.location.toLowerCase().includes(lowercaseQuery)
    );
    
    return Promise.resolve(results);
  }
}

// Exporter une instance unique du service
export const annonceService = new AnnonceService(); 