import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Camera, Shield, Users } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const allowedDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();
    const isAllowedEmail = (e) => {
        if (!allowedDomain) return true;
        const normalized = (e || '').trim().toLowerCase();
        if (!normalized.includes('@')) return false;
        return normalized.split('@').pop() === allowedDomain;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!isAllowedEmail(email)) {
            setIsLoading(false);
            setError(`Only @${allowedDomain} accounts are allowed`);
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (credential) => {
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/google`, { credential, role: 'Teacher' });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed');
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

                    <GoogleAuthButton
                        onCredential={handleGoogleLogin}
                        onError={setError}
                        text="signin_with"
                        enableOneTap
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                        <span>or use your password</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                    </div>

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

                    <div style={{ marginTop: '18px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Don’t have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Create one</Link>
                    </div>
                    {allowedDomain && (
                        <div style={{ marginTop: '14px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Google and password sign-in are limited to <strong>@{allowedDomain}</strong> accounts.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
