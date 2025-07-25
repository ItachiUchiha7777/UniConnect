// src/components/MessageBubble.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message, isMe }) {
  return (
    <View
      style={[
        styles.container,
        isMe ? styles.alignRight : styles.alignLeft,
      ]}
    >
      <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        <Text style={[styles.sender, isMe ? styles.senderRight : styles.senderLeft]}>
          {message.senderId?.name || 'Unknown'}
        </Text>
        <Text style={styles.text}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
  },
  bubbleRight: {
    backgroundColor: '#b1e28bff',
  },
  bubbleLeft: {
    backgroundColor: '#333',
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  senderRight: {
    color: '#155d21',
  },
  senderLeft: {
    color: '#ccc',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    color: '#999',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
});
