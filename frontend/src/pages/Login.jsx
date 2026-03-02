import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Shield, Users } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            login(res.data);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 404) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
                        name: 'Admin', email, password, role: 'Admin'
                    });
                    login(registerRes.data);
                    navigate('/');
                } catch (regErr) {
                    setError(err.response?.data?.message || 'Login failed');
                }
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ display: 'flex', overflow: 'hidden', maxWidth: '900px', width: '100%', borderRadius: '24px' }}>

                <div style={{ flex: 1, padding: '40px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-primary)', marginBottom: '24px' }}>
                        <Camera size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>PresenceIQ</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Manage your attendance with precision and security.
                    </p>
                    <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Shield size={20} color="#10b981" /> Secure</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Users size={20} color="#6366f1" /> Scalable</div>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '60px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to continue to dashboard</p>

                    {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                            <input type="email" placeholder="admin@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '10px' }}>
                            {isLoading ? <div className="loader" style={{ margin: '0 auto' }}></div> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
