// src/components/ChatListItem.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function ChatListItem({ chat, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{chat.name[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.chatName}>{chat.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage?.text || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#5de07a',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  chatName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});
