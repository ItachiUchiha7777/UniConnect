import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../colors';
import API from '../api/api';

const STORAGE_KEY = 'recentProfiles';

export default function SearchUserScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentProfiles, setRecentProfiles] = useState([]);

  useEffect(() => {
    loadRecentProfiles();
  }, []);

  // Load recent profiles from storage
  async function loadRecentProfiles() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setRecentProfiles(JSON.parse(saved));
      else setRecentProfiles([]);
    } catch (e) {
      console.error('Failed to load recent profiles', e);
      setRecentProfiles([]);
    }
  }

  // Save viewed profile into recentProfiles list
  async function saveRecentProfile(profile) {
    if (!profile || !profile._id) return;

    // Prevent duplicates by filtering out existing
    let updated = [profile, ...recentProfiles.filter(p => p._id !== profile._id)];

    // Keep max 10 recent profiles
    if (updated.length > 10) updated = updated.slice(0, 10);

    setRecentProfiles(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // Clear recent profiles list
  async function clearRecentProfiles() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setRecentProfiles([]);
    } catch (e) {
      console.error('Failed to clear recent profiles', e);
    }
  }

  // Search users API call with updated query
  const handleSearch = async (text) => {
    setQuery(text);
    setError(null);

    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await API.get(`/user/search?q=${encodeURIComponent(text)}`);
      setResults(response.data || []);
    } catch (err) {
      setError('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // When a user presses a profile from search results or recent profiles list
  const onPressProfile = async (profile) => {
    // Save to recentProfiles
    await saveRecentProfile(profile);

    // Clear search input and results
    setQuery('');
    setResults([]);
    Keyboard.dismiss();

    // Navigate to profile screen
    navigation.navigate('UserPublicProfile', { userId: profile._id });
  };

  // Render user item (for search results and recent profiles)
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => onPressProfile(item)}
    >
      <Image
        source={{
          uri:
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              item.name,
            )}&background=random&color=fff`,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        {item.registrationNumber ? (
          <Text style={styles.userReg}>{item.registrationNumber}</Text>
        ) : null}
        {item.bio ? (
          <Text numberOfLines={1} style={styles.userBio}>
            {item.bio}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by name or registration number"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={handleSearch}
        autoCorrect={false}
        autoCapitalize="words"
        clearButtonMode="while-editing"
        underlineColorAndroid="transparent"
      />

      {/* Show recent profiles only if input is empty */}
      {query.trim().length === 0 && recentProfiles.length > 0 && (
        <View style={styles.recentProfilesContainer}>
          <View style={styles.recentProfilesHeader}>
            <Text style={styles.recentProfilesTitle}>Recent Profiles</Text>
            <TouchableOpacity onPress={clearRecentProfiles}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
  data={recentProfiles}
  keyExtractor={(item) => item._id}
  renderItem={renderUser}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={true} // or false if you prefer hidden scrollbar
  style={styles.recentProfilesListVertical}
  contentContainerStyle={{ paddingBottom: 10 }}
/>

        </View>
      )}

      {/* Loading and Error UI */}
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Search results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading &&
          query.length > 0 && (
            <Text style={styles.emptyText}>
              {error ? error : 'No users found'}
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    marginTop: Platform.OS === 'ios' ? 60 : '13%',
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.card,
  },
  recentProfilesContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  recentProfilesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentProfilesTitle: {
    color: colors.muted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  recentProfilesList: {
    maxHeight: 70,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.card,
    minWidth: 230,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: colors.card,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  userReg: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: 4,
  },
  userBio: {
    color: colors.muted,
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginVertical: 10,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
});
