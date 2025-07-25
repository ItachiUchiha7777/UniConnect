// src/screens/UserPublicProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserPublicProfileScreen({ route }) {
  const { userId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Public Profile for User {userId}</Text>
      {/* Fetch and render public user profile details */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 18 },
});
