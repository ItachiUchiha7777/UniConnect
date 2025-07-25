import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { dark } = useTheme();
  const { authenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus management function
  const focusInput = () => {
    setTimeout(() => {
      if (inputRef.current && !inputRef.current.disabled) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${chatId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
      // Refocus input after loading messages
      focusInput();
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

  // Focus input when component mounts and when loading state changes
  useEffect(() => {
    if (!loading) {
      focusInput();
    }
  }, [loading]);

  // Handle keyboard events globally to focus input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't interfere with special keys or when user is typing in other inputs
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' ||
        e.ctrlKey || 
        e.altKey || 
        e.metaKey ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'F5'
      ) {
        return;
      }

      // Focus input for regular typing
      if (e.key.length === 1 || e.key === 'Backspace') {
        focusInput();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle clicks on the chat area to focus input
  const handleChatAreaClick = (e) => {
    // Don't focus if clicking on images, links, or buttons
    if (
      e.target.tagName === 'IMG' || 
      e.target.tagName === 'A' || 
      e.target.tagName === 'BUTTON' ||
      e.target.closest('img') ||
      e.target.closest('a') ||
      e.target.closest('button')
    ) {
      return;
    }
    focusInput();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      await API.post('/messages', {
        chatId,
        text: text.trim()
      });
      setText('');
      // Focus input after sending
      focusInput();
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Could not send message');
    } finally {
      setSending(false);
      // Ensure focus even if there was an error
      focusInput();
    }
  };

  const currentUserId = localStorage.getItem('userId');

  return (
    <section
      className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <h2 className="title is-5 mb-3">Chat Room</h2>

      <div
        className="box"
        onClick={handleChatAreaClick}
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 1 ? '#222' : '#fff',
          padding: '1rem',
          borderRadius: '6px',
          cursor: 'text'
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
                ? '#b1e28bff'
                : dark
                ? '#444'
                : '#F1F0F0',
              color: dark && !isMe ? '#fff' : '#000',
            };

            const profileImg =
              msg.senderId?.avatar ||
              'https://www.gravatar.com/avatar/?d=mp&f=y';

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
                {!isMe && (
                  <img
                    src={profileImg}
                    alt="profile"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.75rem',
                      alignSelf: 'flex-end',
                      background: '#eee',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${msg.senderId?._id}`);
                    }}
                  />
                )}
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
                {isMe && (
                  <img
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${currentUserId}`);
                    }}
                    src={profileImg}
                    alt="profile"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginLeft: '0.75rem',
                      alignSelf: 'flex-end',
                      background: '#eee',
                      cursor: 'pointer'
                    }}
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <form className="field has-addons mt-3" onSubmit={handleSend}>
        <div className="control is-expanded">
          <input
            ref={inputRef}
            className="input"
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            onBlur={() => {
              // Refocus after a short delay if not disabled
              setTimeout(() => {
                if (!loading && !sending && inputRef.current) {
                  inputRef.current.focus();
                }
              }, 100);
            }}
            autoFocus 
          />
        </div>
        <div className="control">
          <button
            type="submit"
            className="button is-primary"
            disabled={loading || sending || text.trim() === ''}
            onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </section>
  );
}