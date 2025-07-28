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

  // State logo for all states
  const stateLogoUrl = 'https://img.freepik.com/free-vector/heart-logo-design-vector-minimal-style_53876-136742.jpg?semt=ais_hybrid&w=740';

  // Per-chat custom logos
  const logosMap = {
    LPU: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Lovely_Professional_University_logo.png',
    Rajasthan: '/logos/rajasthan-logo.png',
    Physics: 'https://static.vecteezy.com/system/resources/previews/000/459/729/non_2x/vector-atom-logo-symbol-3d.jpg',
    Chemistry: 'https://static.vecteezy.com/system/resources/previews/014/422/979/non_2x/chemistry-logo-template-illustration-free-vector.jpg',
    Math: 'https://t3.ftcdn.net/jpg/05/51/43/56/360_F_551435602_v0rxhHEIgbQNWozIjcgJOR2Nmp1SINMV.jpg'
  };

  // Lists for group matching
  const btechCourses = [
    'B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech Mech', 'B.Tech Civil',
    'B.Tech Electrical', 'B.Tech Chemical Eng', 'B.Tech Aerospace Eng',
    'B.Tech CSE 2027'
  ];
  const agriCourses = [
    'B.Sc Agriculture', 'B.Sc Horticulture', 'B.Sc Forestry'
  ];

  // List of state group suffixes (for matching)
  const statePattern = /Students$/i; // group name ends with 'Students'

  // Function to select the correct icon based on chat/course name
  const getLogoUrl = (chatName) => {
    if (btechCourses.includes(chatName)) {
      return 'https://i.pinimg.com/736x/1c/54/f7/1c54f7b06d7723c21afc5035bf88a5ef.jpg';
    }
    if (agriCourses.includes(chatName)) {
      return 'https://media.istockphoto.com/id/866393210/vector/farm-icon.jpg?s=612x612&w=0&k=20&c=CZnGt4ER-NjDGJJMzyYaGEz3ko9BoYnuf2vNRp-cMfc=';
    }
    // Unique science icons
    if (chatName === 'Physics' || chatName === 'B.Sc Physics') {
      return logosMap.Physics;
    }
    if (chatName === 'Chemistry' || chatName === 'B.Sc Chemistry') {
      return logosMap.Chemistry;
    }
    if (chatName === 'Math' || chatName === 'B.Sc Mathematics') {
      return logosMap.Math;
    }
    // Any chat name ending with 'Students' is a state group
    if (statePattern.test(chatName)) {
      return stateLogoUrl;
    }
    // fallback to logosMap or default
    return logosMap[chatName] || `https://ui-avatars.com/api/?name=${chatName}`;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    if (!chatId) return;
    if (!socket.connected) socket.connect();
    socket.emit('joinChat', chatId);

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

    return () => {
      socket.off('messageReceived', messageHandler);
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
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="columns is-marginless" style={{ height: '100%' }}>
          <div
            className={`column is-one-quarter ${dark ? 'has-background-grey-darker' : ''}`}
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
                  className={`chat-item ${chatId === chat._id ? 'is-active' : ''} ${dark ? 'has-background-grey-darker' : ''}`}
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
                        src={getLogoUrl(chat.name)}
                        alt={chat.name}
                      />
                    </figure>
                    <div>
                      <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>{chat.name}</p>
                      <p className={`is-size-7 ${dark ? 'has-text-light' : 'has-text-grey'}`}>{chat.lastMessage?.text || 'No messages yet'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

      {/* Mobile layout */}
      {isMobile && (
        <div style={{ height: '100%' }}>
          {isInChat ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                className={`is-flex is-align-items-center p-3 ${dark ? 'has-background-grey-darker' : ''}`}
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
            <div className={`${dark ? 'has-background-grey-darker' : ''}`} style={{ height: '100%', overflowY: 'auto' }}>
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
                          src={getLogoUrl(chat.name)}
                          alt={chat.name}
                        />
                      </figure>
                      <div>
                        <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>{chat.name}</p>
                        <p className={`is-size-7 ${dark ? 'has-text-light' : 'has-text-grey'}`}>{chat.lastMessage?.text || 'No messages yet'}</p>
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
