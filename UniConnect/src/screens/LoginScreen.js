import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import API from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const userId = res.data.userId || res.data.user?._id;
      const name = res.data.name || res.data.user?.name;

      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('name', name);
      signIn({ userId, name });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>UniConnect</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          textContentType="password"
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#5de07a',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins', 
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5de07a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9de8aa',
  },
  buttonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  registerText: {
    color: '#5de07a',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
