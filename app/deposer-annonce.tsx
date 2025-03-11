import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { adService, userService } from '@/constants/ApiService';

// Liste des catégories disponibles
const CATEGORIES = [
  'High-Tech',
  'Maison',
  'Équipements sportifs',
  'Vêtements',
  'Véhicules',
  'Immobilier',
  'Loisirs',
  'Autres'
];

export default function DeposerAnnonceScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('https://via.placeholder.com/150');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        Alert.alert(
          'Connexion requise',
          'Vous devez être connecté pour déposer une annonce',
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

  const handleSubmit = async () => {
    // Validation des champs
    if (!title || !price || !category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour déposer une annonce');
      return;
    }

    try {
      setLoading(true);
      
      // Conversion du prix en nombre
      const priceNumber = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      if (isNaN(priceNumber)) {
        Alert.alert('Erreur', 'Le prix doit être un nombre valide');
        setLoading(false);
        return;
      }
      
      // Création de l'annonce
      const newAnnonce = await adService.createAd({
        title,
        description,
        price: priceNumber,
        category,
        userId: currentUser.id,
        imageUrl
      });

      if (newAnnonce) {
        Alert.alert(
          'Succès',
          'Votre annonce a été publiée avec succès',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/annonces')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la publication de votre annonce');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication de votre annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>Retour</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Déposer une annonce</ThemedText>
        <ThemedView style={{ width: 50 }} />
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>Titre *</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de votre annonce"
            maxLength={100}
          />
        </ThemedView>

        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description détaillée de votre annonce"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </ThemedView>

        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>Prix *</ThemedText>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Prix en euros (ex: 50)"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>Catégorie *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive
                  ]}
                >
                  {cat}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.formGroup}>
          <ThemedText style={styles.label}>Image (URL)</ThemedText>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="URL de l'image"
          />
          <ThemedText style={styles.helperText}>
            Dans une vraie application, vous pourriez télécharger une image depuis votre galerie
          </ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Publier l'annonce
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  form: {
    padding: 16,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#000',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 