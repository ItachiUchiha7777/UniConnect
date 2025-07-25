// src/screens/UserPublicProfileScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Linking,
  TouchableOpacity
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

export default function UserPublicProfileScreen({ route }) {
  const { userId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            style={styles.avatar}
            source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=512` }}
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="school" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Academic </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Course:</Text>
              <Text style={styles.detailValue}>{user.course || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Passing Year:</Text>
              <Text style={styles.detailValue}>{user.passingYear || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Registration No:</Text>
              <Text style={styles.detailValue}>{user.registrationNumber || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${user.email}`)}>
                <Text style={[styles.detailValue, { color: colors.accent }]}>{user.email}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location:</Text>
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
                    <FontAwesome 
                      name={socialIcons[type] || 'link'} 
                      size={18} 
                      color={colors.text} 
                    />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: '600',
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
    marginVertical: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailSection: {
    width: '48%',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  detailItem: {
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  detailValue: {
    color: colors.muted,
  },
  socialSection: {
    marginTop: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  socialButtonText: {
    marginLeft: 8,
    color: colors.text,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    textAlign: 'center',
  },
});