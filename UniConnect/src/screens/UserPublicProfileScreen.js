import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import API from '../api/api';
import { colors } from '../colors';

const socialIcons = {
  instagram: 'instagram',
  telegram: 'telegram',
  twitter: 'twitter',
  linkedin: 'linkedin',
  github: 'github',
  website: 'globe',
};

const windowWidth = Dimensions.get('window').width;

export default function UserPublicProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await API.get(userId ? `/user/${userId}` : '/user/profile');
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, [userId]);

  useEffect(() => {
    async function getPosts() {
      setPostsLoading(true);
      try {
        if (!userId) return;
        const res = await API.get(`/feed/user/${userId}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setPostsLoading(false);
      }
    }
    if (userId) {
      getPosts();
    }
  }, [userId]);

  const handleDeletePost = async (postId) => {
    try {
      await API.delete(`/feed/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (err) {
      console.error('Failed to delete post', err);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const confirmDelete = (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePost(postId),
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  if (!user) return null;

  const handleSocialLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = !userId; // If no userId is provided, it's the current user's profile

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            style={styles.avatar}
            source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=512` }}
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="school" size={26} color={colors.primary} />
              <Text style={styles.sectionTitle}>Academic</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Course</Text>
              <Text style={styles.detailValue}>{user.course || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Passing Year</Text>
              <Text style={styles.detailValue}>{user.passingYear || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Registration No.</Text>
              <Text style={styles.detailValue}>{user.registrationNumber || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={26} color={colors.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${user.email}`)} style={{ flex: 1 }}>
                <Text
                  style={[styles.detailValue, styles.linkText, styles.emailText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user.email}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{user.state || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        {user.socialMedia?.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.socialSection}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="share-alt" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Connect</Text>
              </View>
              <View style={styles.socialButtons}>
                {user.socialMedia.map(({ type, url }, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.socialButton}
                    onPress={() => handleSocialLink(url)}
                  >
                    <FontAwesome name={socialIcons[type] || 'link'} size={18} color={colors.text} />
                    <Text style={styles.socialButtonText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

      {/* Posts Section */}
      <View style={styles.postsContainer}>
        <Text style={styles.postsTitle}>Posts</Text>

        {postsLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.noPostsText}>No posts yet.</Text>
        ) : (
          posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={{
                    uri: post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.name}&background=random&size=128`,
                  }}
                  style={styles.postAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.postUserName}>{post.user.name}</Text>
                  <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
                </View>
                {isCurrentUser && (
                  <TouchableOpacity 
                    onPress={() => confirmDelete(post._id)}
                    style={styles.postActionButton}
                  >
                    <MaterialIcons name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.postContent}>
                {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}
                {post.image ? (
                  <Image 
                    source={{ uri: post.image }} 
                    style={styles.postImage} 
                    resizeMode="cover"
                  />
                ) : null}
              </View>
              
              {/* Post Footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity style={styles.postAction}>
                  <Ionicons name="heart-outline" size={20} color={colors.text} />
                  <Text style={styles.postActionText}>{post.likes?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                  <Text style={styles.postActionText}>{post.comments?.length || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: colors.card,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  bio: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    fontFamily: 'Roboto-Light',
  },
  divider: {
    height: 1,
    backgroundColor: colors.card,
    marginVertical: 20,
  },
  detailsContainer: {
    flexDirection: windowWidth > 600 ? 'row' : 'column',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailSection: {
    width: windowWidth > 600 ? '48%' : '100%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border || '#ccc',
    paddingBottom: 6,
  },
  detailLabel: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 16,
    flexShrink: 1,
  },
  detailValue: {
    color: colors.muted,
    fontSize: 16,
    maxWidth: '60%',
    textAlign: 'right',
    flexShrink: 1,
  },
  linkText: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  emailText: {
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  socialSection: {
    marginTop: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 8,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
  },
  postsContainer: {
    paddingHorizontal: 4,
    marginBottom: 64,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  postsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.card,
  },
  postUserName: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  postTime: {
    fontSize: 12,
    color: colors.muted,
  },
  postContent: {
    marginTop: 4,
  },
  postText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  noPostsText: {
    textAlign: 'center',
    marginVertical: 24,
    color: colors.muted,
    fontSize: 16,
  },
  postActionButton: {
    padding: 6,
    marginLeft: 8,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  postActionText: {
    marginLeft: 6,
    color: colors.text,
    fontSize: 14,
  },
});