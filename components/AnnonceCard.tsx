import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Annonce } from '@/constants/ApiService';

interface AnnonceCardProps {
  annonce: Annonce;
  horizontal?: boolean;
}

export function AnnonceCard({ annonce, horizontal = false }: AnnonceCardProps) {
  const router = useRouter();
  
  // Formater le prix
  const formattedPrice = `${annonce.price} €`;
  
  // Formater la date
  const formattedDate = new Date(annonce.createdAt).toLocaleDateString();

  return (
    <TouchableOpacity 
      style={[styles.annonceCard, horizontal && styles.horizontalCard]}
      onPress={() => router.push(`/annonce/${annonce.id}`)}
    >
      <Image 
        source={{ uri: annonce.imageUrl || 'https://via.placeholder.com/150' }} 
        style={horizontal ? styles.horizontalImage : styles.annonceImage} 
      />
      <ThemedView style={styles.annonceContent}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.annonceTitle}>
          {annonce.title}
        </ThemedText>
        <ThemedText style={styles.annoncePrice}>{formattedPrice}</ThemedText>
        <ThemedView style={styles.annonceDetails}>
          <ThemedText style={styles.annonceCategory}>{annonce.category}</ThemedText>
        </ThemedView>
        <ThemedText style={styles.annonceDate}>{formattedDate}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  annonceCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 250,
    marginRight: 12,
    flexDirection: 'column',
  },
  annonceImage: {
    width: 100,
    height: 100,
  },
  horizontalImage: {
    width: '100%',
    height: 150,
  },
  annonceContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  annonceTitle: {
    fontSize: 16,
  },
  annoncePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  annonceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  annonceCategory: {
    fontSize: 12,
    color: '#666',
  },
  annonceDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
}); 