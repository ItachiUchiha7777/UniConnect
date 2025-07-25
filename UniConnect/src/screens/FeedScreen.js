// src/screens/FeedScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Text,
  Pressable,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import API from '../api';

export default function FeedScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (pageNum = 1, refreshing = false) => {
    try {
      if (refreshing) setRefreshing(true);
      else if (pageNum === 1) setLoadingMore(true);

      const res = await API.get(`/feed?page=${pageNum}`);
      if (pageNum === 1) {
        setPosts(res.data);
      } else {
        setPosts(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length > 0);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      if (refreshing) setRefreshing(false);
      else if (pageNum === 1) setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchPosts(nextPage);
        return nextPage;
      });
    }
  }, [loadingMore, hasMore, fetchPosts]);

  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const alreadyLiked = post.likes?.some(like => like._id === 'current-user-id');
          return {
            ...post,
            likes: alreadyLiked 
              ? post.likes.filter(like => like._id !== 'current-user-id')
              : [...(post.likes || []), { _id: 'current-user-id' }],
            likesCount: alreadyLiked ? post.likesCount - 1 : post.likesCount + 1
          };
        }
        return post;
      }));

      await API.post(`/feed/${postId}/like`);
    } catch (err) {
      console.error('Error liking post:', err);
      // Revert on error
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const alreadyLiked = post.likes?.some(like => like._id === 'current-user-id');
          return {
            ...post,
            likes: alreadyLiked 
              ? post.likes.filter(like => like._id !== 'current-user-id')
              : [...(post.likes || []), { _id: 'current-user-id' }],
            likesCount: alreadyLiked ? post.likesCount - 1 : post.likesCount + 1
          };
        }
        return post;
      }));
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText && !image) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('text', postText);
      
      if (image) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
      }

      const res = await API.post('/feed', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPosts(prev => [res.data, ...prev]);
      setPostText('');
      setImage(null);
      setModalVisible(false);
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfilePress = (userId) => {
    navigation.navigate('UserPublicProfile', { userId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <TouchableOpacity onPress={() => handleProfilePress(item.user._id)}>
                <Image
                  source={{ uri: item.user.avatar || `https://ui-avatars.com/api/?name=${item.user.name}` }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <TouchableOpacity onPress={() => handleProfilePress(item.user._id)}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                </TouchableOpacity>
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>

            {item.text && <Text style={styles.postText}>{item.text}</Text>}
            
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={styles.likeButton}
                onPress={() => handleLike(item._id)}
              >
                <Ionicons 
                  name={item.likes?.some(like => like._id === 'current-user-id') ? "heart" : "heart-outline"} 
                  size={20} 
                  color={item.likes?.some(like => like._id === 'current-user-id') ? "#ff375f" : "#fff"} 
                />
                <Text style={styles.likeCount}>
                  {item.likes?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null
        }
      />

      {/* Floating Post Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Post Creation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.postInput}
                placeholder="What's happening? (Text or news, up to 280 chars)"
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                maxLength={280}
                value={postText}
                onChangeText={setPostText}
              />

              {image && (
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview} 
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={pickImage}
              >
                <Ionicons name="image" size={24} color="#00d1b2" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.postButton,
                  (!postText && !image) && styles.disabledButton
                ]}
                onPress={handlePostSubmit}
                disabled={!postText && !image || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#111', // Dark background
  },
  listContent: {
    padding: 12,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  postContainer: {
    backgroundColor: '#222', // Darker box background
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff', // White text
  },
  timestamp: {
    fontSize: 12,
    color: '#7a7a7a', // Grey text
    marginTop: 2,
  },
  postText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#fff', // White text
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeCount: {
    marginLeft: 6,
    color: '#fff', // White text
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d1b2', // Bulma primary green
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#222', // Dark modal background
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // White text
  },
  modalBody: {
    paddingHorizontal: 16,
  },
  postInput: {
    backgroundColor: '#333', // Dark input background
    borderRadius: 4,
    padding: 12,
    color: '#fff', // White text
    minHeight: 120,
    marginBottom: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#444',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  mediaButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: '#00d1b2', // Bulma primary green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});