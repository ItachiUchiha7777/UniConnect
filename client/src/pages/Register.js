import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '',
        state: '', course: '', passingYear: '', registrationNumber: ''
    });

    const navigate = useNavigate();

    const handleChange = e => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // 🔥 required!
  body: JSON.stringify(form)
});
            if (!res.ok) throw new Error('Registration failed');
            navigate('/dashboard');
        } catch (e) {
            alert('Registration failed: ' + e.message);
        }
    };

    return (
        <section className="section">
            <h1 className="title">Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="columns is-multiline">
                    {/* Render input fields dynamically */}
                    {Object.keys(form).map(field => (
                        <div className="column is-half" key={field}>
                            <div className="field">
                                <label className="label">{field}</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type={field === 'password' ? 'password' : 'text'}
                                        name={field}
                                        value={form[field]}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="button is-success">Register</button>
            </form>
        </section>
    );
}
