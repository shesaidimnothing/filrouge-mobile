// Script pour synchroniser la base de données avec notre schéma Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Synchronisation de la base de données...');

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
    } else {
      console.log('L\'utilisateur admin existe déjà');
    }

    // Créer quelques annonces de test si la table est vide
    const adCount = await prisma.ad.count();
    
    if (adCount === 0) {
      console.log('Création d\'annonces de test...');
      
      // Récupérer l'ID de l'utilisateur admin
      const admin = await prisma.user.findUnique({
        where: {
          email: 'admin@example.com'
        }
      });
      
      if (admin) {
        await prisma.ad.createMany({
          data: [
            {
              title: 'iPhone 13 Pro Max - 256Go',
              description: 'iPhone 13 Pro Max en excellent état, couleur graphite, 256Go de stockage. Livré avec chargeur et coque de protection.',
              price: 750,
              category: 'High-Tech',
              userId: admin.id,
              imageUrl: 'https://via.placeholder.com/150'
            },
            {
              title: 'Canapé d\'angle en cuir',
              description: 'Canapé d\'angle en cuir véritable, couleur marron, très bon état. Dimensions: 250x200cm.',
              price: 450,
              category: 'Maison',
              userId: admin.id,
              imageUrl: 'https://via.placeholder.com/150'
            },
            {
              title: 'VTT Scott Scale 970',
              description: 'VTT Scott Scale 970, taille L, très bon état. Freins à disque hydrauliques, suspension avant.',
              price: 680,
              category: 'Équipements sportifs',
              userId: admin.id,
              imageUrl: 'https://via.placeholder.com/150'
            }
          ]
        });
        
        console.log('Annonces de test créées avec succès');
      } else {
        console.log('Impossible de créer des annonces de test: utilisateur admin non trouvé');
      }
    } else {
      console.log(`${adCount} annonces existent déjà dans la base de données`);
    }

    console.log('Synchronisation terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 