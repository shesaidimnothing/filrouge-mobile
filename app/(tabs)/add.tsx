import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { adService } from '@/constants/ApiService';

const CATEGORIES = [
  'Électronique',
  'Vêtements',
  'Maison',
  'Jardin',
  'Sports',
  'Loisirs',
  'Véhicules',
  'Immobilier',
  'Emploi',
  'Services',
  'Animaux',
  'Autres'
];

export default function AddScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number, email: string } | null>(null);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setCurrentUser(JSON.parse(userJson));
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        Alert.alert(
          'Connexion requise',
          'Vous devez être connecté pour ajouter une annonce',
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

  const pickImage = async () => {
    try {
      // Demander la permission d'accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos');
        return;
      }
      
      // Lancer le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Utiliser l'URI de l'image sélectionnée
        const selectedImage = result.assets[0];
        
        // Si l'image est en base64, on peut l'utiliser directement
        if (selectedImage.base64) {
          setImage(`data:image/jpeg;base64,${selectedImage.base64}`);
        } else {
          // Sinon, on utilise l'URI
          setImage(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return false;
    }
    
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return false;
    }
    
    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour ajouter une annonce');
      router.push('/login');
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données de l'annonce
      const newAd = {
        title,
        description,
        price: Number(price),
        category,
        image: image || 'https://via.placeholder.com/300x200?text=Pas+d%27image'
      };
      
      console.log('Envoi de l\'annonce:', newAd);
      
      // Ajouter l'annonce via le service API
      const result = await adService.addAd(newAd);
      
      if (result) {
        Alert.alert(
          'Succès',
          'Votre annonce a été publiée avec succès',
          [
            {
              text: 'Voir mes annonces',
              onPress: () => router.push('/(tabs)/admin')
            },
            {
              text: 'Retour à l\'accueil',
              onPress: () => router.push('/(tabs)/')
            }
          ]
        );
        
        // Réinitialiser le formulaire
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory(CATEGORIES[0]);
        setImage(null);
      } else {
        Alert.alert('Erreur', 'Impossible de publier l\'annonce. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>Ajouter une annonce</ThemedText>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText type="defaultSemiBold">Titre</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de l'annonce"
            maxLength={100}
          />
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText type="defaultSemiBold">Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description détaillée de l'annonce"
            multiline
            numberOfLines={5}
            maxLength={1000}
          />
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText type="defaultSemiBold">Prix (€)</ThemedText>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Prix en euros"
            keyboardType="numeric"
            maxLength={10}
          />
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText type="defaultSemiBold">Catégorie</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.formGroup}>
          <ThemedText type="defaultSemiBold">Image</ThemedText>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <ThemedText>Sélectionner une image</ThemedText>
          </TouchableOpacity>
          
          {image && (
            <ThemedView style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <ThemedText style={styles.removeImageText}>Supprimer</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Publier l'annonce</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginTop: 50,
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  imagePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007aff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 