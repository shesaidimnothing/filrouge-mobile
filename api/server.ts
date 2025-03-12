import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import adRoutes from './routes/adRoutes';
import userRoutes from './routes/userRoutes';
import responseRoutes from './routes/responseRoutes';
import messageRoutes from './routes/messageRoutes';

// Initialiser Prisma
const prisma = new PrismaClient();

// Initialiser Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/messages', messageRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Projet Fil Rouge' });
});

// Route de santé pour vérifier si l'API est disponible
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gérer la fermeture propre de la connexion Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma }; 