// src/screens/FeedScreen.js
import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import FeedPost from '../components/FeedPost';
import API from '../api';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get('/feed')
      .then(res => setPosts(res.data))
      .catch(err => console.error('Error fetching feed:', err));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <FeedPost post={item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  listContent: {
    padding: 12,
  },
});
