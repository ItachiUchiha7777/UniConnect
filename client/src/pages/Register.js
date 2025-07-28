import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
    const { dark } = useTheme();
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '',
        state: '', course: '', passingYear: '', registrationNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const courses = [
        'B.Tech CSE',
        'B.Tech IT',
        'B.Tech ECE',
        'B.Tech Mech',
        'B.Tech Civil',
        'B.Tech Electrical',
        'B.Tech Chemical Eng',
        'B.Tech Aerospace Eng',
        'B.Sc Agriculture',
        'B.Sc Horticulture',
        'B.Sc Forestry',
        'B.Sc Biotechnology',
        'BBA',
        'BCA',
        'B.Com',
        'B.A',
        'B.Sc Physics',
        'B.Sc Chemistry',
        'B.Sc Mathematics',

        'B.Pharm',
        'B.Arch',
        'LLB'
    ];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        years.push(year);
    }

    const handleChange = e => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            
            navigate('/dashboard');
        } catch (e) {
            alert('Registration failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const getFieldLabel = (field) => {
        const labels = {
            name: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number',
            password: 'Password',
            state: 'State',
            course: 'Course',
            passingYear: 'Passing Year',
            registrationNumber: 'Registration Number'
        };
        return labels[field] || field;
    };

    const renderField = (field) => {
        const commonProps = {
            name: field,
            value: form[field],
            onChange: handleChange,
            required: true
        };

        switch (field) {
            case 'state':
                return (
                    <div className="select is-fullwidth">
                        <select {...commonProps}>
                            <option value="">Select State</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'course':
                return (
                    <div className="select is-fullwidth">
                        <select {...commonProps}>
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'passingYear':
                return (
                    <div className="select is-fullwidth">
                        <select {...commonProps}>
                            <option value="">Select Passing Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'phone':
                return (
                    <input
                        className="input"
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        pattern="[0-9]{10}"
                        maxLength="10"
                        {...commonProps}
                    />
                );

            case 'email':
                return (
                    <input
                        className="input"
                        type="email"
                        placeholder="Enter your email address"
                        {...commonProps}
                    />
                );

            case 'password':
                return (
                    <input
                        className="input"
                        type="password"
                        placeholder="Enter a strong password"
                        minLength="6"
                        {...commonProps}
                    />
                );

            case 'name':
                return (
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter your full name"
                        {...commonProps}
                    />
                );

            case 'registrationNumber':
                return (
                    <input
                        className="input"
                        type="number"
                        placeholder="Enter registration/roll number"
                        {...commonProps}
                    />
                );

            default:
                return (
                    <input
                        className="input"
                        type="text"
                        {...commonProps}
                    />
                );
        }
    };

    return (
        <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}>
            <div className="container">
                <div className="columns is-centered">
                    <div className="column is-8-desktop is-10-tablet">
                        <div className={`box ${dark ? 'has-background-grey-darker' : ''}`}>
                            <div className="has-text-centered mb-6">
                                <h1 className={`title is-3 ${dark ? 'has-text-white' : ''}`}>
                                    <span className="icon-text">
                                        <span className="icon">
                                            <i className="fas fa-user-plus"></i>
                                        </span>
                                        <span>Create Account</span>
                                    </span>
                                </h1>
                                <p className={`subtitle is-5 ${dark ? 'has-text-light' : 'has-text-grey'}`}>
                                    Join our student community today
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="columns is-multiline">
                                    {Object.keys(form).map(field => (
                                        <div className="column is-half-desktop is-full-mobile" key={field}>
                                            <div className="field">
                                                <label className={`label ${dark ? 'has-text-white' : ''}`}>
                                                    {getFieldLabel(field)}
                                                    <span className="has-text-danger"> *</span>
                                                </label>
                                                <div className="control has-icons-left">
                                                    {renderField(field)}
                                                    <span className="icon is-small is-left">
                                                        <i className={`fas ${
                                                            field === 'name' ? 'fa-user' :
                                                            field === 'email' ? 'fa-envelope' :
                                                            field === 'phone' ? 'fa-phone' :
                                                            field === 'password' ? 'fa-lock' :
                                                            field === 'state' ? 'fa-map-marker-alt' :
                                                            field === 'course' ? 'fa-graduation-cap' :
                                                            field === 'passingYear' ? 'fa-calendar' :
                                                            'fa-id-card'
                                                        }`}></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="field is-grouped is-grouped-centered mt-5">
                                    <div className="control">
                                        <button 
                                            className={`button is-success is-large ${loading ? 'is-loading' : ''}`}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            <span className="icon-text">
                                                <span className="icon">
                                                    <i className="fas fa-user-check"></i>
                                                </span>
                                                <span>Create Account</span>
                                            </span>
                                        </button>
                                    </div>
                                    <div className="control">
                                        <button 
                                            className="button is-light is-large"
                                            type="button"
                                            onClick={() => navigate('/login')}
                                        >
                                            <span className="icon-text">
                                                <span className="icon">
                                                    <i className="fas fa-sign-in-alt"></i>
                                                </span>
                                                <span>Already have account?</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="has-text-centered mt-4">
                                <p className={`is-size-7 ${dark ? 'has-text-light' : 'has-text-grey'}`}>
                                    By registering, you agree to our terms and conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}