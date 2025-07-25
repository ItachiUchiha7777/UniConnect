// src/components/FeedPost.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FeedPost({ post }) {
  const navigation = useNavigation();

  return (
    <View style={styles.box}>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={() => navigation.navigate('UserPublicProfile', { userId: post.user._id })}
      >
        <Image
          source={{ uri: post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.name}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{post.user.name}</Text>
        <Text style={styles.date}>{new Date(post.createdAt).toLocaleString()}</Text>
      </TouchableOpacity>

      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.feedImage} />
      ) : null}

      <TouchableOpacity style={styles.likeBtn}>
        <Text style={styles.like}>{post.likes?.length || 0} ❤️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#222',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    marginRight: 10,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 12,
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  text: {
    color: '#fff',
    marginBottom: 12,
  },
  feedImage: {
    borderRadius: 12,
    width: '100%',
    minHeight: 180,
    marginBottom: 12,
  },
  likeBtn: {
    alignSelf: 'flex-start',
  },
  like: {
    color: '#f66',
    fontWeight: 'bold',
  },
});
