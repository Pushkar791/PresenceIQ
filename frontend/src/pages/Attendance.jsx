import React, { useRef, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, RefreshCw, CheckCircle, UserX, UserCheck } from 'lucide-react';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    const [mode, setMode] = useState('manual');
    const [subject, setSubject] = useState('DSOOPS');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    useEffect(() => {
        let timeoutId;
        if (mode === 'live' && stream && !loading) {
            timeoutId = setTimeout(() => {
                processFrame();
            }, 2000);
        }
        return () => clearTimeout(timeoutId);
    }, [mode, stream, loading]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
        } catch (err) {
            setResult({ status: 'error', text: 'Camera unavailable' });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const processFrame = async () => {
        if (!stream) return;
        setLoading(true);
        setResult(null);

        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const blob = await fetch(dataUrl).then(r => r.blob());

        const formData = new FormData();
        formData.append('photo', blob, 'live_frame.jpg');
        formData.append('subject', subject);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/attendance`, formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            const st = res.data.student;
            setResult({ status: 'success', text: `Verified: ${st.name} (${st.roll_no})` });
            setRecentLogs(prev => [{ name: st.name, roll_no: st.roll_no, time: res.data.record.time, subject: res.data.record.subject }, ...prev].slice(0, 5));
        } catch (err) {
            setResult({ status: 'error', text: err.response?.data?.message || 'Face not recognized' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Live Attendance Check</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Identify faces in real-time using PresenceIQ.</p>
                </div>
                <div style={{ background: 'var(--glass-bg)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex' }}>
                    <button
                        onClick={() => setMode('manual')}
                        style={{ background: mode === 'manual' ? 'var(--accent-primary)' : 'transparent', color: mode === 'manual' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s' }}
                    >Manual Trigger</button>
                    <button
                        onClick={() => setMode('live')}
                        style={{ background: mode === 'live' ? 'var(--accent-primary)' : 'transparent', color: mode === 'live' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s' }}
                    >Continuous Mode</button>
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontWeight: '500' }}>Select Subject:</div>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '250px', background: 'white', color: 'var(--text-primary)', border: '1px solid #e4e4e7', borderRadius: '10px', padding: '10px 15px', color: '#18181b', fontWeight: '500' }}>
                    <option value="DSOOPS">DSOOPS</option>
                    <option value="BEE (Backend engg)">BEE (Backend engg)</option>
                    <option value="IOT">IOT</option>
                    <option value="LINUX">LINUX</option>
                    <option value="COMPUTER NETWORK (CN)">COMPUTER NETWORK (CN)</option>
                </select>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Attendance will be logged under this subject for the current session.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Camera size={20} /> Viewfinder</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!stream ? (
                                <button className="btn-primary" style={{ padding: '8px 20px', width: 'auto' }} onClick={startCamera}>Turn On Camera</button>
                            ) : (
                                <button onClick={stopCamera} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }}>Turn Off</button>
                            )}
                        </div>
                    </div>

                    <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!stream && <p style={{ color: 'var(--text-secondary)' }}>Camera Preview Offline</p>}
                        <video
                            ref={videoRef} autoPlay playsInline muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: stream ? 'block' : 'none', transform: 'scaleX(-1)' }}
                        />

                        {stream && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '40px', zIndex: 10, transition: 'all 0.3s', boxShadow: mode === 'live' ? '0 0 30px rgba(16, 185, 129, 0.4)' : 'none' }}>
                                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '40px', height: '40px', borderTop: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderLeft: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderTopLeftRadius: '40px', transition: 'all 0.3s' }}></div>
                                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '40px', height: '40px', borderTop: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderRight: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderTopRightRadius: '40px', transition: 'all 0.3s' }}></div>
                                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '40px', height: '40px', borderBottom: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderLeft: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderBottomLeftRadius: '40px', transition: 'all 0.3s' }}></div>
                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '40px', height: '40px', borderBottom: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderRight: `4px solid ${mode === 'live' ? '#10b981' : 'var(--accent-primary)'}`, borderBottomRightRadius: '40px', transition: 'all 0.3s' }}></div>
                            </div>
                        )}
                    </div>

                    <div style={{ pading: '24px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '24px' }}>
                        {mode === 'manual' ? (
                            <button
                                className="btn-primary"
                                onClick={processFrame}
                                disabled={!stream || loading}
                                style={{ maxWidth: '300px', fontSize: '1.2rem', padding: '16px', borderRadius: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
                            >
                                {loading ? <RefreshCw size={24} className="loader" style={{ animationDuration: '0.8s' }} /> : <><CheckCircle size={24} /> Authenticate Now</>}
                            </button>
                        ) : (
                            <div style={{ maxWidth: '300px', fontSize: '1.2rem', padding: '16px', borderRadius: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)' }}>
                                {loading ? <RefreshCw size={24} className="loader" style={{ animationDuration: '0.8s' }} /> : <Camera size={24} style={{ animation: 'pulse 2s infinite' }} />}
                                {loading ? 'Scanning Frame...' : 'Live Monitoring Active'}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className="glass-panel" style={{ padding: '30px', flexShrink: 0 }}>
                        <h3 style={{ marginBottom: '20px' }}>Verification Result</h3>
                        {!result && !loading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>Awaiting frame...</p>}
                        {result && (
                            <div style={{
                                padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
                                background: result.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                border: `1px solid ${result.status === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                            }}>
                                {result.status === 'error' ? <UserX size={48} color="#ef4444" /> : <UserCheck size={48} color="#10b981" />}
                                <span style={{ fontSize: '1.2rem', fontWeight: '500', color: result.status === 'error' ? '#ef4444' : '#10b981' }}>{result.text}</span>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel" style={{ padding: '30px', flexGrow: 1 }}>
                        <h3 style={{ marginBottom: '20px' }}>Live Logs</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentLogs.map((log, idx) => (
                                <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{log.name}</p>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.roll_no}</span>
                                            <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '2px 8px', borderRadius: '10px' }}>{log.subject}</span>
                                        </div>
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.time}</span>
                                </div>
                            ))}
                            {recentLogs.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>No recent verifications in this session.</p>}
                        </div>
                    </div>

                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Attendance;
