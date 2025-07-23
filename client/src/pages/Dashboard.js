import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get('/chats/user');
        setChats(res.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const getColorForType = (type) => {
    switch (type) {
      case 'global': return 'is-primary';
      case 'course': return 'is-success';
      case 'batch': return 'is-info';
      case 'state': return 'is-warning';
      default: return 'is-light';
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="has-text-centered">
          <button className="button is-loading is-large is-primary">Loading chats...</button>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}>
      <h1 className="title">Your Chats</h1>

      {chats.length === 0 && (
        <p className="has-text-centered">No chats found. Try registering again?</p>
      )}

      <div className="columns is-multiline">
        {chats.map(chat => (
          <div className="column is-half" key={chat._id}>
            <div
              className={`box ${dark ? 'has-background-grey-darker has-text-white' : ''} is-clickable`}
              onClick={() => navigate(`/chat/${chat._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <span className={`tag ${getColorForType(chat.type)} is-medium mb-2`}>
                {chat.type.toUpperCase()}
              </span>
              <h2 className="title is-5">{chat.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
