import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { adService, Annonce } from '@/constants/ApiService';

// Identifiants admin (dans une vraie application, cela serait stocké de manière sécurisée)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function AdminScreen() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number, email: string } | null>(null);

  useEffect(() => {
    checkUserLoggedIn();
    loadAnnonces();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        // Vérifier si l'utilisateur est admin (email admin@example.com)
        if (user.email !== 'admin@example.com') {
          Alert.alert('Accès refusé', 'Vous n\'avez pas les droits d\'administration');
          router.replace('/(tabs)');
        }
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        Alert.alert(
          'Connexion requise',
          'Vous devez être connecté en tant qu\'administrateur pour accéder à cette page',
          [
            {
              text: 'Se connecter',
              onPress: () => router.push('/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
    }
  };

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const data = await adService.getAllAds();
      setAnnonces(data);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      Alert.alert('Erreur', 'Impossible de charger les annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour supprimer une annonce
  const handleDeleteAnnonce = async (id: number) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette annonce ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Supprimer", 
          onPress: async () => {
            try {
              setLoading(true);
              const success = await adService.deleteAd(id);
              
              if (success) {
                // Mettre à jour la liste des annonces localement
                setAnnonces(annonces.filter(annonce => annonce.id !== id));
                Alert.alert("Succès", "L'annonce a été supprimée avec succès");
              } else {
                Alert.alert("Erreur", "Impossible de supprimer l'annonce");
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert("Erreur", "Une erreur est survenue lors de la suppression");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Fonction pour supprimer toutes les annonces
  const handleDeleteAllAnnonces = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer TOUTES les annonces ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Supprimer tout", 
          onPress: async () => {
            try {
              setLoading(true);
              const success = await adService.deleteAllAds();
              
              if (success) {
                // Vider la liste des annonces localement
                setAnnonces([]);
                Alert.alert("Succès", "Toutes les annonces ont été supprimées avec succès");
              } else {
                Alert.alert("Erreur", "Impossible de supprimer les annonces");
              }
            } catch (error) {
              console.error('Erreur lors de la suppression de toutes les annonces:', error);
              Alert.alert("Erreur", "Une erreur est survenue lors de la suppression");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Rendu d'un élément de la liste des annonces
  const renderAnnonceItem = ({ item }: { item: Annonce }) => (
    <ThemedView style={styles.annonceCard}>
      <ThemedView style={styles.annonceContent}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText>{item.price} €</ThemedText>
        <ThemedView style={styles.annonceDetails}>
          <ThemedText style={styles.annonceCategory}>{item.category}</ThemedText>
        </ThemedView>
      </ThemedView>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteAnnonce(item.id)}
        disabled={loading}
      >
        <ThemedText style={styles.deleteButtonText}>Supprimer</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Administration</ThemedText>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutButtonText}>Déconnexion</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Gestion des annonces</ThemedText>
      
      <TouchableOpacity 
        style={styles.deleteAllButton}
        onPress={handleDeleteAllAnnonces}
        disabled={loading || annonces.length === 0}
      >
        <ThemedText style={styles.deleteAllButtonText}>Supprimer toutes les annonces</ThemedText>
      </TouchableOpacity>
      
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
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
  sectionTitle: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontWeight: 'bold',
  },
  deleteAllButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  annoncesList: {
    gap: 16,
  },
  annonceCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  annonceContent: {
    flex: 1,
    gap: 4,
  },
  annonceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  annonceCategory: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
}); 