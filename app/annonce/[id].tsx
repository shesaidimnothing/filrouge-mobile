import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { adService, Annonce } from '@/constants/ApiService';

export default function AnnonceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnnonce();
  }, [id]);

  const loadAnnonce = async () => {
    if (!id) {
      setError('Identifiant d\'annonce manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await adService.getAdById(Number(id));
      
      if (data) {
        setAnnonce(data);
      } else {
        setError('Annonce non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      setError('Impossible de charger l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (annonce?.user) {
      Alert.alert(
        'Contacter le vendeur',
        `Voulez-vous contacter ${annonce.user.name} à propos de cette annonce ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Contacter', onPress: () => {
            // Dans une vraie application, on pourrait ouvrir une conversation avec le vendeur
            Alert.alert('Message envoyé', 'Votre message a été envoyé au vendeur.');
          }}
        ]
      );
    } else {
      Alert.alert(
        'Contacter le vendeur',
        'Impossible de contacter le vendeur pour le moment.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <ThemedText style={styles.loadingText}>Chargement de l'annonce...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !annonce) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error || 'Une erreur est survenue'}</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Formater le prix
  const formattedPrice = `${annonce.price} €`;
  
  // Formater la date
  const formattedDate = new Date(annonce.createdAt).toLocaleDateString();

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <Image 
        source={{ uri: annonce.imageUrl || 'https://via.placeholder.com/400' }} 
        style={styles.image}
        resizeMode="cover"
      />

      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>{annonce.title}</ThemedText>
        <ThemedText style={styles.price}>{formattedPrice}</ThemedText>
        
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.category}>{annonce.category}</ThemedText>
          <ThemedText style={styles.date}>
            Publiée le {formattedDate}
          </ThemedText>
        </ThemedView>

        {annonce.user && (
          <ThemedText style={styles.seller}>
            Vendeur: {annonce.user.name}
          </ThemedText>
        )}

        <ThemedView style={styles.divider} />

        <ThemedText type="subtitle">Description</ThemedText>
        <ThemedText style={styles.description}>
          {annonce.description || 'Aucune description fournie'}
        </ThemedText>

        <ThemedView style={styles.divider} />

        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContact}
        >
          <ThemedText style={styles.contactButtonText}>Contacter le vendeur</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  seller: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 