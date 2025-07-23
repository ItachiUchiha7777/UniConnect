import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import ChatRoom from './ChatRoom';

export default function ChatLayout() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get('/chats/user');
        setChats(res.data);
      } catch (err) {
        console.error('Failed to load chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const isInChat = location.pathname.includes('/chat/');

  return (
    <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`} 
      style={{ paddingTop: '1rem', height: 'calc(100vh - 60px)' }}>
      
      {/* Desktop Layout - Always show both sidebar and chat */}
      {!isMobile && (
        <div className="columns is-marginless" style={{ height: '100%' }}>
          {/* Chat List Sidebar */}
          <div className={`column is-one-quarter ${dark ? 'has-background-grey-darker' : ''}`} 
            style={{ borderRight: dark ? '1px solid #444' : '1px solid #eee', overflowY: 'auto' }}>
            <h2 className={`title is-4 ${dark ? 'has-text-white' : ''}`} style={{ padding: '1rem' }}>Messages</h2>
            {loading ? (
              <div className="has-text-centered py-5">
                <p className={dark ? 'has-text-light' : ''}>Loading chats...</p>
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat._id}
                  className={`chat-item ${chatId === chat._id ? 'is-active' : ''} ${dark ? 'has-background-grey-darker' : ''}`}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderLeft: chatId === chat._id ? '3px solid #3273dc' : 'none'
                  }}
                >
                  <div className="is-flex is-align-items-center">
                    <figure className="image is-48x48 mr-3">
                      <img 
                        className="is-rounded" 
                        src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`} 
                        alt={chat.name}
                      />
                    </figure>
                    <div>
                      <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>{chat.name}</p>
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
              <div className="has-text-centered" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className={`icon is-large mb-4 ${dark ? 'has-text-grey-light' : 'has-text-grey'}`}>
                  <i className="fas fa-comments fa-3x"></i>
                </span>
                <p className={`title is-4 ${dark ? 'has-text-white' : ''}`}>Select a chat</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Layout - Show either chat list OR chat room */}
      {isMobile && (
        <div style={{ height: '100%' }}>
          {isInChat ? (
            /* Full Screen Chat View */
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Mobile Chat Header */}
              <div className={`is-flex is-align-items-center p-3 ${dark ? 'has-background-grey-darker' : ''}`}
                style={{ borderBottom: dark ? '1px solid #444' : '1px solid #eee' }}>
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
                  {chats.find(c => c._id === chatId)?.name || 'Chat'}
                </p>
              </div>
              
              {/* Chat Content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ChatRoom key={chatId} />
              </div>
            </div>
          ) : (
            /* Full Screen Chat List View */
            <div className={`${dark ? 'has-background-grey-darker' : ''}`} style={{ height: '100%', overflowY: 'auto' }}>
              <h2 className={`title is-4 p-3 ${dark ? 'has-text-white' : ''}`}>Messages</h2>
              {loading ? (
                <div className="has-text-centered py-5">
                  <p className={dark ? 'has-text-light' : ''}>Loading chats...</p>
                </div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat._id}
                    className={`chat-item ${dark ? 'has-background-grey-darker' : ''}`}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      borderBottom: dark ? '1px solid #444' : '1px solid #eee'
                    }}
                  >
                    <div className="is-flex is-align-items-center">
                      <figure className="image is-48x48 mr-3">
                        <img 
                          className="is-rounded" 
                          src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`} 
                          alt={chat.name}
                        />
                      </figure>
                      <div>
                        <p className={`has-text-weight-semibold ${dark ? 'has-text-white' : ''}`}>{chat.name}</p>
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