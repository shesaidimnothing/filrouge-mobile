import { Request, Response } from 'express';
import { prisma } from '../server';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe pour des raisons de sécurité
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe pour des raisons de sécurité
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Créer un nouvel utilisateur
export const createUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  // Validation des données
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Dans une application réelle, le mot de passe devrait être haché
        name
      }
    });
    
    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: name || existingUser.name,
        password: password || existingUser.password
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe pour des raisons de sécurité
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Connexion d'un utilisateur
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('Tentative de connexion avec:', { email, password });
  
  // Validation des données
  if (!email || !password) {
    console.log('Erreur: Email et mot de passe requis');
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  try {
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    // Vérifier si l'utilisateur existe et si le mot de passe correspond
    if (!user) {
      console.log('Erreur: Utilisateur non trouvé');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('Mot de passe fourni:', password);
    console.log('Mot de passe en base:', user.password);
    
    if (user.password !== password) {
      console.log('Erreur: Mot de passe incorrect');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Connexion réussie pour:', email);
    
    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
}; 