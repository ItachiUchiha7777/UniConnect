import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import ChatRoom from './ChatRoom';

export default function ChatLayout() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`} style={{paddingTop: '1rem', height: 'calc(100vh - 60px)'}}>
      <div className="columns" style={{ margin: 0, height: '100%' }}>
        {/* Left Side - Chat List */}
        <div className="column is-one-third" style={{ borderRight: '1px solid #ccc', overflowY: 'auto' }}>
          <h2 className="title is-5 mb-3">Your Chats</h2>
          {loading ? (
            <p>Loading chats…</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                className={`box ${dark ? 'has-background-grey-darker has-text-white' : ''}`}
                style={{ cursor: 'pointer', border: chatId === chat._id ? '2px solid #3273dc' : '' }}
                onClick={() => navigate(`/chat/${chat._id}`)}
              >
                <strong>{chat.name}</strong>
                <br />
                <span className="tag is-light is-small mt-1">{chat.type}</span>
              </div>
            ))
          )}
        </div>

        {/* Right Side - Chat Messages */}
        <div className="column is-two-thirds" style={{ height: '100%', overflow: 'hidden' }}>
          {chatId ? (
            <ChatRoom key={chatId} />
          ) : (
            <div className="has-text-centered mt-6">
              <p className="title is-4">Select a chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
