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
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

const SOCIAL_TYPES = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'GitHub', value: 'github' },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();

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
  const [dropdownZIndex, setDropdownZIndex] = useState(1000);

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

  const handleAvatarChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to upload an avatar');
        return;
      }

      setUploadingAvatar(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setUploadingAvatar(false);
        return;
      }

      const image = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: image.uri,
        name: `avatar-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      const res = await API.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile({ ...profile, avatar: res.data.avatar });
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await API.put('/user/profile', {
        bio: profile.bio,
        socialMedia: profile.socialMedia.filter(sm => sm.type && sm.url),
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderDropdownItem = (item, selected, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.dropdownItem,
        selected && { backgroundColor: '#2a2a2a' }
      ]}
    >
      <Text style={[styles.dropdownItemText, selected && { color: '#5de07a' }]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Profile Settings</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=222222&color=5de07a`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handleAvatarChange}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator color="#5de07a" size="small" />
              ) : (
                <Text style={styles.avatarButtonText}>Change Avatar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Read-only Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput 
            style={styles.input} 
            value={profile.name} 
            editable={false} 
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            value={profile.email} 
            editable={false} 
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <TextInput 
            style={styles.input} 
            value={profile.phone} 
            editable={false} 
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>State</Text>
          <TextInput 
            style={styles.input} 
            value={profile.state} 
            editable={false} 
          />
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.bio}
            onChangeText={text => setProfile({ ...profile, bio: text })}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Social Media Links */}
        <View style={styles.section}>
          <Text style={styles.label}>Social Media Links</Text>
          {profile.socialMedia.map((sm, idx) => (
            <View key={idx} style={styles.socialRow}>
              <Dropdown
                style={[styles.dropdown, styles.socialPlatform]}
                data={SOCIAL_TYPES}
                labelField="label"
                valueField="value"
                placeholder="Platform"
                value={sm.type}
                onChange={item => handleSocialChange(idx, 'type', item.value)}
                renderItem={item => renderDropdownItem(
                  item, 
                  sm.type === item.value,
                  () => handleSocialChange(idx, 'type', item.value)
                )}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                containerStyle={[styles.dropdownContainer, { zIndex: dropdownZIndex + idx }]}
                itemTextStyle={styles.dropdownItemText}
                activeColor="#2a2a2a"
                search
                searchPlaceholder="Search..."
                maxHeight={200}
                onFocus={() => setDropdownZIndex(2000 + idx)}
                onBlur={() => setDropdownZIndex(1000)}
                flatListProps={{
                  keyboardShouldPersistTaps: 'always'
                }}
              />
              <TextInput
                style={[styles.input, styles.socialUrl]}
                placeholder="Profile URL"
                value={sm.url}
                onChangeText={text => handleSocialChange(idx, 'url', text)}
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity 
                onPress={() => removeSocial(idx)} 
                style={styles.removeSocialButton}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addSocial}>
            <Text style={styles.addButtonText}>+ Add Social Link</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSubmit} 
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#181820" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await signOut();
            } catch (err) {
              Alert.alert('Logout failed', 'Please try again.');
            }
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer Section */}
        <View style={styles.footer}>
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity 
              onPress={() => openLink('https://www.instagram.com/rohitgusain_.22/')}
              style={styles.iconButton}
            >
              <Ionicons name="logo-instagram" size={24} color="#5de07a" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://www.linkedin.com/in/rohitgusaindev/')}
              style={styles.iconButton}
            >
              <Ionicons name="logo-linkedin" size={24} color="#5de07a" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://t.me/UniConnecttee')}
              style={styles.iconButton}
            >
              <Ionicons name="paper-plane" size={24} color="#5de07a" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://rohit-gusain-iportfolio.netlify.app/')}
              style={styles.iconButton}
            >
              <MaterialIcons name="public" size={24} color="#5de07a" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerText}>
            Made with <Text style={{ color: 'red' }}>❤</Text> by Rohit Gusain
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5de07a',
    marginBottom: 25,
    marginTop: 10,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#5de07a',
    backgroundColor: '#222',
  },
  avatarButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#222',
    borderRadius: 20,
  },
  avatarButtonText: {
    color: '#5de07a',
    fontWeight: '600',
    fontSize: 15,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#989fa6',
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1c1e24',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
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
    zIndex: 1,
  },
  socialPlatform: {
    flex: 1.2,
    marginRight: 8,
  },
  socialUrl: {
    flex: 2,
    marginRight: 8,
  },
  dropdown: {
    height: 48,
    backgroundColor: '#1c1e24',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dropdownPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownIcon: {
    tintColor: '#5de07a',
    width: 20,
    height: 20,
  },
  dropdownContainer: {
    backgroundColor: '#1c1e24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#1c1e24',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  addButtonText: {
    color: '#5de07a',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#5de07a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#181820',
    fontWeight: 'bold',
    fontSize: 17,
  },
  removeSocialButton: {
    width: 40,
    height: 40,
    backgroundColor: '#b22222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logoutButton: {
    backgroundColor: '#c0392b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 20,
  },
  iconButton: {
    padding: 10,
  },
  footerText: {
    color: '#989fa6',
    fontSize: 14,
    textAlign: 'center',
  },
});