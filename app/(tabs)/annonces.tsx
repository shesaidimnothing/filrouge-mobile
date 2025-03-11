import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AnnonceCard } from '@/components/AnnonceCard';
import { adService, Annonce } from '@/constants/ApiService';

export default function AnnoncesScreen() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les annonces au montage du composant
    loadAnnonces();
  }, []);

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const data = await adService.getAllAds();
      setAnnonces(data);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnnonceItem = ({ item }: { item: Annonce }) => (
    <AnnonceCard annonce={item} />
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Annonces</ThemedText>
        <TouchableOpacity 
          style={styles.depositButton}
          onPress={() => router.push('/deposer-annonce')}
        >
          <ThemedText style={styles.depositButtonText}>Déposer une annonce</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText>Catégories</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText>Prix</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText>Localisation</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <ThemedText style={styles.loadingText}>Chargement des annonces...</ThemedText>
        </ThemedView>
      ) : annonces.length === 0 ? (
        <ThemedText style={styles.emptyText}>Aucune annonce disponible</ThemedText>
      ) : (
        <FlatList
          data={annonces}
          renderItem={renderAnnonceItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.annoncesList}
          showsVerticalScrollIndicator={false}
          onRefresh={loadAnnonces}
          refreshing={loading}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  depositButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  depositButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  annoncesList: {
    gap: 16,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
}); 