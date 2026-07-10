import React, { useMemo, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Camera, ShieldCheck } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const allowedDomain = useMemo(
        () => (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase(),
        []
    );

    const isAllowedEmail = (e) => {
        if (!allowedDomain) return true;
        const normalized = (e || '').trim().toLowerCase();
        if (!normalized.includes('@')) return false;
        return normalized.split('@').pop() === allowedDomain;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isAllowedEmail(email)) {
            setIsLoading(false);
            setError(`Only @${allowedDomain} accounts are allowed`);
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                name,
                email,
                password,
                role: 'Teacher'
            });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Sign up failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async (credential) => {
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/google`, {
                credential,
                role: 'Teacher'
            });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google sign up failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card signup-card">
                <div className="auth-info-panel signup-info">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-primary)', marginBottom: '24px' }}>
                        <Camera size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2.3rem', marginBottom: '14px' }}>Create your account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        Use your institution email to access PresenceIQ.
                    </p>
                    {allowedDomain && (
                        <div style={{ marginTop: '26px', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.10)', color: '#10b981', width: 'fit-content' }}>
                            <ShieldCheck size={18} />
                            Allowed domain: <strong>@{allowedDomain}</strong>
                        </div>
                    )}
                </div>

                <div className="auth-form-panel">
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Sign Up</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Create a teacher account to continue</p>

                    {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                    <GoogleAuthButton
                        onCredential={handleGoogleSignUp}
                        onError={setError}
                        text="signup_with"
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                        <span>or create with email</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                    </div>

                    <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full name</label>
                            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                            <input type="email" placeholder={allowedDomain ? `name@${allowedDomain}` : 'name@school.edu'} value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '10px' }}>
                            {isLoading ? <div className="loader" style={{ margin: '0 auto' }}></div> : 'Create account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '18px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link>
                    </div>
                    {allowedDomain && (
                        <div style={{ marginTop: '14px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Google signup automatically creates a <strong>Teacher</strong> account for <strong>@{allowedDomain}</strong> users.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignUp;

