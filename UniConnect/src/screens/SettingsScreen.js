import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import API from '../api';
import { launchImageLibrary } from 'react-native-image-picker';

const SOCIAL_TYPES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
];

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    bio: '',
    avatar: '',
    socialMedia: [],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch profile info on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await API.get('/user/profile');
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          state: res.data.state || '',
          bio: res.data.bio || '',
          avatar: res.data.avatar || '',
          socialMedia: res.data.socialMedia || [],
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile');
      }
    }
    fetchProfile();
  }, []);

  // Handle social media array
  const handleSocialChange = (index, field, value) => {
    const newSocial = [...profile.socialMedia];
    newSocial[index] = { ...newSocial[index], [field]: value };
    setProfile({ ...profile, socialMedia: newSocial });
  };

  const addSocial = () => {
    setProfile({
      ...profile,
      socialMedia: [...profile.socialMedia, { type: '', url: '' }],
    });
  };

  const removeSocial = (index) => {
    setProfile({
      ...profile,
      socialMedia: profile.socialMedia.filter((_, i) => i !== index),
    });
  };

  // Avatar picker and upload
  const handleAvatarChange = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
      },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Cannot open image picker');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setUploadingAvatar(true);
          const image = response.assets[0];
          const formData = new FormData();
          formData.append('avatar', {
            uri: image.uri,
            name: image.fileName || 'avatar.jpg',
            type: image.type || 'image/jpeg',
          });
          try {
            const res = await API.post('/user/avatar', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile({ ...profile, avatar: res.data.avatar });
          } catch {
            Alert.alert('Error', 'Failed to upload avatar');
          } finally {
            setUploadingAvatar(false);
          }
        }
      }
    );
  };

  // Save profile handler
  const handleSubmit = async () => {
    setSaving(true);
    try {
      await API.put('/user/profile', {
        bio: profile.bio,
        socialMedia: profile.socialMedia,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile Settings</Text>

      {/* Avatar Section */}
      <View style={styles.section}>
        <Image
          source={{
            uri:
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=222222&color=5de07a`,
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarChange} disabled={uploadingAvatar}>
          {uploadingAvatar ? (
            <ActivityIndicator color="#5de07a" />
          ) : (
            <Text style={styles.avatarButtonText}>Change Avatar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Read-only Fields */}
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={profile.name} editable={false} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={profile.email} editable={false} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={profile.phone} editable={false} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={profile.state} editable={false} />
      </View>

      {/* Editable Bio */}
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#888"
          multiline
        />
      </View>

      {/* Social Media Links */}
      <View style={styles.section}>
        <Text style={styles.label}>Social Media Links</Text>
        {profile.socialMedia.map((sm, idx) => (
          <View key={idx} style={styles.socialRow}>
            <TextInput
              style={[styles.input, styles.socialPlatform]}
              placeholder="Platform (e.g. Twitter)"
              value={sm.type}
              onChangeText={(text) => handleSocialChange(idx, 'type', text)}
              placeholderTextColor="#888"
            />
            <TextInput
              style={[styles.input, styles.socialUrl]}
              placeholder="Profile URL"
              value={sm.url}
              onChangeText={(text) => handleSocialChange(idx, 'url', text)}
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity onPress={() => removeSocial(idx)} style={styles.removeSocialButton}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addSocial}>
          <Text style={styles.addButtonText}>+ Add Social Link</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5de07a',
    marginBottom: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#5de07a',
    backgroundColor: '#222',
  },
  avatarButton: {
    alignSelf: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 3,
  },
  avatarButtonText: {
    color: '#5de07a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    color: '#989fa6',
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#1c1e24',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#222',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  socialPlatform: {
    flex: 1,
    backgroundColor: '#181820',
    marginRight: 4,
  },
  socialUrl: {
    flex: 2,
    backgroundColor: '#181820',
    marginRight: 4,
  },
  addButton: {
    backgroundColor: '#181820',
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 7,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#5de07a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#5de07a',
    padding: 15,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 14,
  },
  saveButtonText: {
    color: '#181820',
    fontWeight: 'bold',
    fontSize: 17,
  },
  removeSocialButton: {
    marginLeft: 2,
    backgroundColor: '#b22222',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
