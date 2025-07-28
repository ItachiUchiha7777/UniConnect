import React, { useState, useEffect } from 'react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import AvatarEditor from 'react-avatar-editor'; // For image cropping


const SOCIAL_TYPES = [
  { value: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
  { value: 'telegram', label: 'Telegram', icon: 'fab fa-telegram' },
  { value: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin' },
  { value: 'github', label: 'GitHub', icon: 'fab fa-github' },
];


export default function Settings() {
  const { dark } = useTheme();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    bio: '',
    avatar: '',
    socialMedia: []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);


  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await API.get('/user/profile');
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          state: res.data.state || '',
          bio: res.data.bio || '',
          avatar: res.data.avatar || '',
          socialMedia: res.data.socialMedia || []
        });
      } catch (err) {
        alert('Failed to load profile');
      }
    }
    fetchProfile();
  }, []);


  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setShowAvatarEditor(true);
    }
  };


  // Handle social media changes
  const handleSocialChange = (index, field, value) => {
    const newSocial = [...profile.socialMedia];
    newSocial[index] = { ...newSocial[index], [field]: value };
    setProfile({...profile, socialMedia: newSocial});
  };


  const addSocial = () => {
    setProfile({
      ...profile,
      socialMedia: [...profile.socialMedia, { type: '', url: '' }]
    });
  };


  const removeSocial = (index) => {
    setProfile({
      ...profile,
      socialMedia: profile.socialMedia.filter((_, i) => i !== index)
    });
  };


  // Save cropped avatar
  const saveAvatar = async () => {
    if (editor) {
      const canvas = editor.getImageScaledToCanvas();
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');
        
        try {
          const res = await API.post('/user/avatar', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
           });
          setProfile({...profile, avatar: res.data.avatar});
          setShowAvatarEditor(false);
        } catch {
          alert('Avatar upload failed');
        }
      }, 'image/jpeg', 0.9);
    }
  };


  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);


    try {
      await API.put('/user/profile', {
        bio: profile.bio,
        socialMedia: profile.socialMedia
      });
      alert('Profile updated successfully');
    } catch {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  return (
    <section className={`section ${dark ? 'has-background-dark' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className={`container ${dark ? 'has-text-white' : ''}`} style={{ flex: 1 }}>
        <h1 className={`title ${dark ? 'has-text-white' : ''}`}>Profile Settings</h1>
        
        <form onSubmit={handleSubmit}>
            {profile.avatar && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <figure className="image is-192x192">
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="is-rounded" 
                    style={{ border: '3px solid #00d1b2', width: '192px', height: '192px', objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  />
                </figure>
              </div>
            )}
            {/* Avatar Upload */}
            <div className="field">
              <label className="label">Profile Picture</label>
              <div className="file has-name is-boxed">
                <label className="file-label">
                  <input 
                    className="file-input" 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label">
                      Choose an avatar...
                    </span>
                  </span>
                  {avatarFile && (
                    <span className="file-name">
                      {avatarFile.name}
                    </span>
                  )}
                </label>
              </div>
            </div>


            {/* Avatar Editor Modal */}
            {showAvatarEditor && (
              <div className="modal is-active">
                <div className="modal-background"></div>
                <div className="modal-content">
                  <div className={`box ${dark ? 'has-background-grey-darker' : ''}`}>
                    <h3 className={`title is-4 ${dark ? 'has-text-white' : ''}`}>Crop Your Avatar</h3>
                    <AvatarEditor
                      ref={setEditor}
                      image={avatarFile}
                      width={250}
                      height={250}
                      border={50}
                      borderRadius={125}
                      color={[0, 0, 0, 0.6]} // RGBA
                      scale={scale}
                      rotate={0}
                    />
                    <div className="field mt-4">
                      <label className={`label ${dark ? 'has-text-white' : ''}`}>Zoom</label>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.01"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="slider is-fullwidth"
                      />
                    </div>
                    <div className="buttons is-right">
                      <button 
                        type="button" 
                        className="button is-danger"
                        onClick={() => setShowAvatarEditor(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="button is-primary"
                        onClick={saveAvatar}
                      >
                        Save Avatar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Read-only Fields */}
            <div className="field">
              <label className="label">Name</label>
              <div className="control">
                <input 
                  className="input" 
                  value={profile.name} 
                  readOnly 
                  disabled
                />
              </div>
            </div>


            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <input 
                  className="input" 
                  value={profile.email} 
                  readOnly 
                  disabled
                />
              </div>
            </div>


            <div className="field">
              <label className="label">Phone</label>
              <div className="control">
                <input 
                  className="input" 
                  value={profile.phone} 
                  readOnly 
                  disabled
                />
              </div>
            </div>


            <div className="field">
              <label className="label">State</label>
              <div className="control">
                <input 
                  className="input" 
                  value={profile.state} 
                  readOnly 
                  disabled
                />
              </div>
            </div>


            {/* Editable Bio */}
            <div className="field">
              <label className="label">Bio</label>
              <div className="control">
                <textarea 
                  className="textarea" 
                  value={profile.bio} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>


            {/* Social Media Links */}
            <div className="field">
              <label className="label">Social Media Links</label>
              {profile.socialMedia.map((sm, idx) => (
                <div className="field is-grouped mb-3" key={idx}>
                  <div className="control">
                    <div className={`select ${dark ? 'is-dark' : ''}`}>
                      <select
                        value={sm.type}
                        onChange={(e) => handleSocialChange(idx, 'type', e.target.value)}
                        required
                      >
                        <option value="" disabled>Select platform</option>
                        {SOCIAL_TYPES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="control is-expanded">
                    <input
                      type="url"
                      className="input"
                      placeholder="Profile URL"
                      value={sm.url}
                      onChange={(e) => handleSocialChange(idx, 'url', e.target.value)}
                      required
                    />
                  </div>
                  <div className="control">
                    <button
                      type="button"
                      className={`button ${dark ? 'is-dark' : 'is-light'}`}
                      onClick={() => removeSocial(idx)}
                    >
                      <span className="icon">
                        <i className="fas fa-times"></i>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className={`button ${dark ? 'is-dark' : 'is-light'}`}
                onClick={addSocial}
              >
                <span className="icon">
                  <i className="fas fa-plus"></i>
                </span>
                <span>Add Social Link</span>
              </button>
            </div>


            {/* Save Button */}
            <div className="field">
              <div className="control">
                <button 
                  className={`button is-primary ${saving ? 'is-loading' : ''}`} 
                  type="submit" 
                  disabled={saving}
                >
                  Save Changes
                </button>
              </div>
            </div>
        </form>
      </div>


      {/* Bulma Footer */}
      <footer className={`footer ${dark ? 'has-background-dark' : ''}`} style={{ marginTop: '8%',borderRadius: '10px', padding: '2rem 1.5rem' }}>
  <div className="content has-text-centered">
    <div className="columns is-mobile is-multiline is-vcentered is-centered">
      {/* Social Icons */}
      {[
        { href: 'https://t.me/UniConnecttee', icon: 'telegram' },
        { href: 'https://www.instagram.com/rohitgusain_.22/', icon: 'instagram' },
        { href: 'https://www.linkedin.com/in/rohitgusaindev/', icon: 'linkedin' },
        { href: 'https://rohit-gusain-iportfolio.netlify.app/', icon: 'globe' },
      ].map(({ href, icon }) => (
        <div className="column is-narrow" key={icon}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="icon is-large"
            style={{
              color: dark ? '#5de07a' : '#00d1b2',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
           <i className={`${icon === 'globe' ? 'fas fa-globe' : `fab fa-${icon}`} fa-2x`}></i>
          </a>
        </div>
      ))}
    </div>

    <p className={dark ? 'has-text-white' : ''} style={{ marginTop: 16, fontWeight: 'bold' }}>
      Made with 💙 by Rohit Gusain
    </p>
  </div>
</footer>

    </section>
  );
}
