import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../colors';
import API from '../api/api';

export default function SearchUserScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (text) => {
    setQuery(text);
    
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
        console.log(text)
      const response = await API.get(`/user/search?q=${encodeURIComponent(text)}`);
        console.log(text+"nikka")

      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => navigation.navigate('UserPublicProfile', { userId: item._id })}
    >
      <Image
        source={{
          uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        {item.registrationNumber && (
          <Text style={styles.userReg}>{item.registrationNumber}</Text>
        )}
        {item.bio && (
          <Text numberOfLines={1} style={styles.userBio}>
            {item.bio}
          </Text>
        )}
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
      />

      {loading && (
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loader}
        />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && query.length > 0 && (
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
    marginTop: "13%",
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
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
  },
});