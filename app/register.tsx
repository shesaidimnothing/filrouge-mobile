import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '@/constants/ApiService';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation des champs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const user = await userService.register({ name, email, password });
      
      if (user) {
        // Stocker les informations de l'utilisateur
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        Alert.alert(
          'Succès',
          'Votre compte a été créé avec succès',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création du compte');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.registerContainer}>
        <Text style={styles.title}>Projet Fil Rouge</Text>
        <Text style={styles.subtitle}>Créer un compte</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Entrez votre nom"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Entrez votre email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Entrez votre mot de passe"
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre mot de passe"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  registerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  registerButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
  },
}); 