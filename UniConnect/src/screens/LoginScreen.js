// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) return;

  setLoading(true);
  try {
   const response = await fetch('http://172.24.107.163:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
    console.log('Login response:', response);
    const res = await response.json();

    if (response.ok) {
      // Assuming response contains userId and name
      const userId = res.userId || res.user?._id;
      const name = res.name || res.user?.name;

      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('name', name);
      signIn({ userId, name });
    } else {
      // Handle error response
      alert(res.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', padding: 20 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  registerText: { color: '#5de07a', marginTop: 12, textAlign: 'center' },
});
