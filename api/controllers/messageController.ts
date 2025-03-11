import { Request, Response } from 'express';
import { prisma } from '../server';

// Récupérer tous les messages d'un utilisateur (envoyés et reçus)
export const getUserMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId) },
          { receiverId: parseInt(userId) }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
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
    
    res.json(messages);
  } catch (error) {
    console.error(`Erreur lors de la récupération des messages de l'utilisateur ${userId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

// Récupérer les conversations d'un utilisateur
export const getUserConversations = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    // Récupérer tous les utilisateurs avec qui l'utilisateur a échangé des messages
    const sentMessages = await prisma.privateMessage.findMany({
      where: {
        senderId: parseInt(userId)
      },
      select: {
        receiverId: true
      },
      distinct: ['receiverId']
    });
    
    const receivedMessages = await prisma.privateMessage.findMany({
      where: {
        receiverId: parseInt(userId)
      },
      select: {
        senderId: true
      },
      distinct: ['senderId']
    });
    
    // Combiner les IDs uniques des utilisateurs
    const contactIds = new Set([
      ...sentMessages.map(msg => msg.receiverId),
      ...receivedMessages.map(msg => msg.senderId)
    ]);
    
    // Récupérer les informations des utilisateurs
    const contacts = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(contactIds)
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    // Pour chaque contact, récupérer le dernier message
    const conversations = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await prisma.privateMessage.findFirst({
          where: {
            OR: [
              {
                senderId: parseInt(userId),
                receiverId: contact.id
              },
              {
                senderId: contact.id,
                receiverId: parseInt(userId)
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        return {
          contact,
          lastMessage
        };
      })
    );
    
    res.json(conversations);
  } catch (error) {
    console.error(`Erreur lors de la récupération des conversations de l'utilisateur ${userId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};

// Récupérer les messages entre deux utilisateurs
export const getConversation = async (req: Request, res: Response) => {
  const { userId, contactId } = req.params;
  
  try {
    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(userId),
            receiverId: parseInt(contactId)
          },
          {
            senderId: parseInt(contactId),
            receiverId: parseInt(userId)
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    res.json(messages);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la conversation entre ${userId} et ${contactId}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
  }
};

// Envoyer un message
export const sendMessage = async (req: Request, res: Response) => {
  const { content, senderId, receiverId } = req.body;
  
  // Validation des données
  if (!content || !senderId || !receiverId) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }
  
  try {
    // Vérifier si les utilisateurs existent
    const sender = await prisma.user.findUnique({
      where: {
        id: parseInt(senderId)
      }
    });
    
    if (!sender) {
      return res.status(404).json({ error: 'Expéditeur non trouvé' });
    }
    
    const receiver = await prisma.user.findUnique({
      where: {
        id: parseInt(receiverId)
      }
    });
    
    if (!receiver) {
      return res.status(404).json({ error: 'Destinataire non trouvé' });
    }
    
    // Créer le message
    const newMessage = await prisma.privateMessage.create({
      data: {
        content,
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId)
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

// Marquer un message comme lu
export const markMessageAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Vérifier si le message existe
    const existingMessage = await prisma.privateMessage.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingMessage) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    // Marquer le message comme lu
    const updatedMessage = await prisma.privateMessage.update({
      where: {
        id: parseInt(id)
      },
      data: {
        read: true,
        status: 'read'
      }
    });
    
    res.json(updatedMessage);
  } catch (error) {
    console.error(`Erreur lors du marquage du message ${id} comme lu:`, error);
    res.status(500).json({ error: 'Erreur lors du marquage du message comme lu' });
  }
};

// Marquer tous les messages d'une conversation comme lus
export const markConversationAsRead = async (req: Request, res: Response) => {
  const { userId, contactId } = req.params;
  
  try {
    // Marquer tous les messages reçus comme lus
    await prisma.privateMessage.updateMany({
      where: {
        senderId: parseInt(contactId),
        receiverId: parseInt(userId),
        read: false
      },
      data: {
        read: true,
        status: 'read'
      }
    });
    
    res.json({ message: 'Tous les messages ont été marqués comme lus' });
  } catch (error) {
    console.error(`Erreur lors du marquage des messages comme lus:`, error);
    res.status(500).json({ error: 'Erreur lors du marquage des messages comme lus' });
  }
}; 