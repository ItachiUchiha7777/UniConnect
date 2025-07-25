// src/screens/ChatRoomScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';

export default function ChatRoomScreen({ route, navigation }) {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${chatId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId, currentUserId]);

  const handleSend = async () => {
    if (!text.trim() || sending || !currentUserId) return;

    setSending(true);
    try {
      await API.post('/messages', {
        chatId,
        text: text.trim()
      });
      setText('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      Alert.alert('Error', 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const MessageBubble = ({ message }) => {
    const isMe = message.senderId?._id === currentUserId;
    const profileImg = message.senderId?.avatar || 'https://via.placeholder.com/150';

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {!isMe && (
          <TouchableOpacity onPress={() => navigation.navigate('UserPublicProfile', { userId: message.senderId?._id })}>
            <Image
              source={{ uri: profileImg }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        )}

        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          {!isMe && (
            <Text style={styles.senderName}>
              {message.senderId?.name || 'Unknown'}
            </Text>
          )}
          <Text style={styles.messageText}>
            {message.text}
          </Text>
          <Text style={styles.timeText}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {isMe && (
          <TouchableOpacity onPress={() => navigation.navigate('UserPublicProfile', { userId: currentUserId })}>
            <Image
              source={{ uri: profileImg }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Custom empty component that handles keyboard dismissal
  const EmptyComponent = () => (
    <TouchableOpacity 
      activeOpacity={1} 
      style={styles.emptyContainer}
      onPress={Keyboard.dismiss}
    >
      <Text style={{ color: '#fff' }}>No messages yet. Start the conversation!</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#25D366" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListEmptyComponent={<EmptyComponent />}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          onScrollBeginDrag={Keyboard.dismiss}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            editable={!loading && !sending}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            color="#fff"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading || sending || text.trim() === ''}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(34, 34, 34)',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgb(34, 34, 34)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400, // Ensure it takes enough space for touch
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
    backgroundColor: '#444',
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    maxWidth: 250,
  },
  myMessageBubble: {
    backgroundColor: '#25D366',
    borderTopRightRadius: 0,
  },
  theirMessageBubble: {
    backgroundColor: '#23272A',
    borderTopLeftRadius: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#5de07a',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
    color: '#bbb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgb(34, 34, 34)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(113, 111, 111, 0.2)',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#23272A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#5de07a',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});