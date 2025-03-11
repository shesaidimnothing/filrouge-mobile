import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AnnonceCard } from '@/components/AnnonceCard';
import { adService, Annonce } from '@/constants/ApiService';

export default function HomeScreen() {
  const router = useRouter();
  const [recentAnnonces, setRecentAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les annonces au montage du composant
    loadRecentAnnonces();
  }, []);

  const loadRecentAnnonces = async () => {
    try {
      setLoading(true);
      const data = await adService.getAllAds();
      // Trier les annonces par date (les plus récentes d'abord) et prendre les 5 premières
      const sortedAnnonces = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
      setRecentAnnonces(sortedAnnonces);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces récentes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f5f5f5', dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <ThemedText type="title" style={styles.headerTitle}>Projet Fil Rouge</ThemedText>
        </ThemedView>
      }>
      <ThemedView style={styles.container}>
        {/* Bouton Déposer une annonce */}
        <TouchableOpacity 
          style={styles.depositButton}
          onPress={() => router.push('/deposer-annonce')}
        >
          <ThemedText style={styles.depositButtonText}>Déposer une annonce</ThemedText>
        </TouchableOpacity>

        {/* Section "C'est le moment de vendre" */}
        <ThemedView style={styles.sellSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>C'est le moment de vendre</ThemedText>
          <TouchableOpacity 
            style={styles.depositButton}
            onPress={() => router.push('/deposer-annonce')}
          >
            <ThemedText style={styles.depositButtonText}>Déposer une annonce</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Section "Tendance en ce moment" */}
        <ThemedView style={styles.trendingSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Tendance en ce moment</ThemedText>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/categorie/cadeaux')}>
              <ThemedText style={styles.categoryText}>Idées cadeaux</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/categorie/sportifs')}>
              <ThemedText style={styles.categoryText}>Équipements sportifs</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/categorie/tech')}>
              <ThemedText style={styles.categoryText}>High-Tech</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/categorie/maison')}>
              <ThemedText style={styles.categoryText}>Maison</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>

        {/* Section "Top catégories" */}
        <ThemedView style={styles.topCategoriesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Top catégories</ThemedText>
          
          <TouchableOpacity style={styles.categoryLargeCard} onPress={() => router.push('/categorie/vetements')}>
            <ThemedText style={styles.categoryLargeText}>Vêtements</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Section "Annonces récentes" */}
        <ThemedView style={styles.recentSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Annonces récentes</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/annonces')}>
              <ThemedText style={styles.viewAllText}>Voir tout</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          {loading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <ThemedText style={styles.loadingText}>Chargement des annonces...</ThemedText>
            </ThemedView>
          ) : recentAnnonces.length === 0 ? (
            <ThemedText style={styles.emptyText}>Aucune annonce pour le moment</ThemedText>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.recentAnnoncesScroll}
            >
              {recentAnnonces.map((annonce) => (
                <AnnonceCard key={annonce.id.toString()} annonce={annonce} horizontal={true} />
              ))}
            </ScrollView>
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  depositButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sellSection: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  trendingSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontWeight: '600',
  },
  topCategoriesSection: {
    gap: 16,
  },
  categoryLargeCard: {
    backgroundColor: '#e0e0e0',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLargeText: {
    fontWeight: '600',
    fontSize: 16,
  },
  recentSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#666',
    fontSize: 14,
  },
  recentAnnoncesScroll: {
    flexDirection: 'row',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  }
});
