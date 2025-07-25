import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import ChatRoom from './ChatRoom';
import socket from '../socket'; // Import socket instance

export default function ChatLayout() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Logos mapping: chat name to logo URL
  const logosMap = {
    LPU: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Lovely_Professional_University_logo.png',
    Punjab: 'https://www.shutterstock.com/search/haryana-state',
    Haryana: '/logos/haryana-logo.png',
    Rajasthan: '/logos/rajasthan-logo.png',
    'B.Tech CSE': 'https://i.pinimg.com/736x/1c/54/f7/1c54f7b06d7723c21afc5035bf88a5ef.jpg',
    'B.Tech CSE 2027': 'https://i.pinimg.com/736x/1c/54/f7/1c54f7b06d7723c21afc5035bf88a5ef.jpg',

    'Uttarakhand Students': 'https://nlcbharat.org/wp-content/uploads/2024/02/Uttarakhand.png',
     'Andhra Pradesh Students': 'https://upload.wikimedia.org/wikipedia/en/6/6f/Emblem_of_Andhra_Pradesh.png',
    'Karnataka Students': 'https://upload.wikimedia.org/wikipedia/en/3/37/Emblem_of_Karnataka.svg',
    'Kerala Students': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Emblem_of_Kerala.svg',
    'Tamil Nadu Students': 'https://upload.wikimedia.org/wikipedia/en/b/b7/Emblem_of_Tamil_Nadu.svg',
    'Telangana Students': 'https://upload.wikimedia.org/wikipedia/en/6/6a/Emblem_of_Telangana.svg',
    'Puducherry Students': 'https://upload.wikimedia.org/wikipedia/en/0/0f/Seal_of_Puducherry.svg'
  };

  // Handle resize to adjust isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chats once
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get('/chats/user');
        setChats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load chats', err);
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // Socket.IO: handle joining chat and updates to chats list
  useEffect(() => {
    if (!chatId) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join current chat room
    socket.emit('joinChat', chatId);

    // Listen for new messages
    const messageHandler = (newMessage) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === newMessage.chatId
            ? { ...chat, lastMessage: newMessage }
            : chat
        )
      );
    };

    socket.on('messageReceived', messageHandler);

    // Clean up on unmount or chat change
    return () => {
      socket.off('messageReceived', messageHandler);
      // optionally: socket.emit('leaveChat', chatId);
    };
  }, [chatId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const isInChat = location.pathname.includes('/chat/');

  return (
    <section
      className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}
      style={{ paddingTop: '1rem', height: 'calc(100vh - 60px)' }}
    >
      {/* Desktop Layout: sidebar + chat */}
      {!isMobile && (
        <div className="columns is-marginless" style={{ height: '100%' }}>
          {/* Chat List Sidebar */}
          <div
            className={`column is-one-quarter ${
              dark ? 'has-background-grey-darker' : ''
            }`}
            style={{
              borderRight: dark ? '1px solid #444' : '1px solid #eee',
              overflowY: 'auto',
            }}
          >
            <h2 className={`title is-4 ${dark ? 'has-text-white' : ''}`} style={{ padding: '1rem' }}>
              Messages
            </h2>
            {loading ? (
              <div className="has-text-centered py-5">
                <p className={dark ? 'has-text-light' : ''}>Loading chats...</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${
                    chatId === chat._id ? 'is-active' : ''
                  } ${dark ? 'has-background-grey-darker' : ''}`}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderLeft: chatId === chat._id ? '3px solid #3273dc' : 'none',
                  }}
                >
                  <div className="is-flex is-align-items-center">
                    <figure className="image is-48x48 mr-3">
                      <img
                        className="is-rounded"
                        src={
                          logosMap[chat.name] ||
                          chat.avatar ||
                          `https://ui-avatars.com/api/?name=${chat.name}`
                        }
                        alt={chat.name}
                      />
                    </figure>
                    <div>
                      <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>
                        {chat.name}
                      </p>
                      <p className={`is-size-7 ${dark ? 'has-text-light' : 'has-text-grey'}`}>
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="column" style={{ height: '100%', overflow: 'hidden' }}>
            {chatId ? (
              <ChatRoom key={chatId} />
            ) : (
              <div
                className="has-text-centered"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className={`icon is-large mb-4 ${dark ? 'has-text-grey-light' : 'has-text-grey'}`}>
                    <i className="fas fa-comments fa-3x"></i>
                  </span>
                  <p className={`title is-4 ${dark ? 'has-text-white' : ''}`}>Select a chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile layout: either chat list or chat room */}
      {isMobile && (
        <div style={{ height: '100%' }}>
          {isInChat ? (
            // Full screen chat view with header and back button
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                className={`is-flex is-align-items-center p-3 ${
                  dark ? 'has-background-grey-darker' : ''
                }`}
                style={{ borderBottom: dark ? '1px solid #444' : '1px solid #eee' }}
              >
                <button
                  className="button is-small is-ghost mr-3"
                  onClick={handleBack}
                  aria-label="Back to messages"
                >
                  <span className="icon">
                    <i className={`fas fa-arrow-left ${dark ? 'has-text-white' : ''}`}></i>
                  </span>
                </button>
                <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>
                  {chats.find((c) => c._id === chatId)?.name || 'Chat'}
                </p>
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ChatRoom key={chatId} />
              </div>
            </div>
          ) : (
            // Full screen chat list view
            <div
              className={`${dark ? 'has-background-grey-darker' : ''}`}
              style={{ height: '100%', overflowY: 'auto' }}
            >
              <h2 className={`title is-4 p-3 ${dark ? 'has-text-white' : ''}`}>Messages</h2>
              {loading ? (
                <div className="has-text-centered py-5">
                  <p className={dark ? 'has-text-light' : ''}>Loading chats...</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item ${dark ? 'has-background-grey-darker' : ''}`}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      borderBottom: dark ? '1px solid #444' : '1px solid #eee',
                    }}
                  >
                    <div className="is-flex is-align-items-center">
                      <figure className="image is-48x48 mr-3">
                        <img
                          className="is-rounded"
                          src={
                            logosMap[chat.name] ||
                            chat.avatar ||
                            `https://ui-avatars.com/api/?name=${chat.name}`
                          }
                          alt={chat.name}
                        />
                      </figure>
                      <div>
                        <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>
                          {chat.name}
                        </p>
                        <p className={`is-size-7 ${dark ? 'has-text-light' : 'has-text-grey'}`}>
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
