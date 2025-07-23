import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ChatRoom() {
  const { chatId } = useParams();
  const { dark } = useTheme();
  const { authenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${chatId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId, authenticated]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await API.post('/messages', {
        chatId,
        text: text.trim()
      });
      setText('');
      fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Could not send message');
    }
  };

  const currentUserId = localStorage.getItem('userId');

  return (
    <section
      className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <h2 className="title is-5 mb-3">Chat Room</h2>

      {/* Message list */}
      <div
        className="box"
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: dark ? '#222' : '#fff',
          padding: '1rem',
          borderRadius: '6px'
        }}
      >
        {loading && <p>Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p>No messages yet. Start the conversation!</p>
        )}

        <div>
          {messages.map((msg) => {
  const isMe = msg.senderId?._id === currentUserId;

  const align = isMe ? 'flex-end' : 'flex-start';
  const bubbleStyle = {
    maxWidth: '75%',
    borderRadius: '16px',
    padding: '0.65rem 1rem',
    wordWrap: 'break-word',
    backgroundColor: isMe
      ? '#DCF8C6'  // ✅ Greenish for me
      : dark
      ? '#444'     // ✅ Dark grey for others in dark mode
      : '#F1F0F0', // ✅ Light mode color for others
    color: dark && !isMe ? '#fff' : '#000', // ✅ Text color depending on theme
  };

  return (
    <div
      key={msg._id}
      style={{
        display: 'flex',
        justifyContent: align,
        marginBottom: '0.5rem',
        paddingLeft: isMe ? '1rem' : '0',
        paddingRight: isMe ? '0' : '1rem',
      }}
    >
      <div style={bubbleStyle}>
        <p className="is-size-7 has-text-weight-semibold" style={{ marginBottom: '0.25rem' }}>
          {msg.senderId?.name || 'Unknown'}
          <span
            className="has-text-grey is-size-7"
            style={{ float: 'right', marginLeft: '10px' }}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </p>
        <p className="is-size-6" style={{ marginBottom: 0 }}>{msg.text}</p>
      </div>
    </div>
  );
})}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Input */}
      <form className="field has-addons mt-3" onSubmit={handleSend}>
        <div className="control is-expanded">
          <input
            className="input"
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
            }}
          />
        </div>
        <div className="control">
          <button
            type="submit"
            className="button is-primary"
            disabled={loading || text.trim() === ''}
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
