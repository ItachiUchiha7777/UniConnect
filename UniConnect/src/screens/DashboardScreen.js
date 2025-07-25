// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import API from '../api';
import ChatListItem from '../components/ChatListItem';

export default function DashboardScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    API.get('/chats/user').then(res => setChats(res.data));
  }, []);

  return (
    <FlatList
      data={chats}
      keyExtractor={chat => chat._id}
      renderItem={({ item }) => (
        <ChatListItem chat={item} onPress={() => navigation.navigate('ChatRoom', { chatId: item._id })} />
      )}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}
