// src/components/FeedPost.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedPost({ post, onLike }) {
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Image
          source={{ uri: post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.name}` }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      
      {post.text && <Text style={styles.text}>{post.text}</Text>}
      
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <TouchableOpacity style={styles.likeButton} onPress={onLike}>
        <Ionicons 
          name={post.likes?.length ? "heart" : "heart-outline"} 
          size={20} 
          color={post.likes?.length ? "#ff375f" : "#fff"} 
        />
        <Text style={styles.likeCount}>
          {post.likes?.length || 0}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  text: {
    color: '#fff',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#fff',
    marginLeft: 6,
  },
});