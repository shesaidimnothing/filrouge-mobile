import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '@/constants/ApiService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const result = await userService.login(email, password);
      
      if (result && result.user) {
        // Stocker les informations de l'utilisateur
        await AsyncStorage.setItem('currentUser', JSON.stringify(result.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Projet Fil Rouge</Text>
        <Text style={styles.subtitle}>Connexion</Text>
        
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
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>Créer un compte</Text>
        </TouchableOpacity>

        <Text style={styles.adminHint}>
          Utilisez admin@example.com / admin123 pour vous connecter en tant qu'administrateur
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
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
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
  },
  adminHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  }
}); 